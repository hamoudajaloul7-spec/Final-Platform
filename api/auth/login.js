export default async function handler(request, response) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return response.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Robust body parsing for Vercel environments
    let body = request.body;

    // If body is empty or not parsed, try to parse it from raw (if available)
    if (!body || Object.keys(body).length === 0) {
      // In some Vercel versions, we might need to handle the stream or it's already in request.body as a string
      if (typeof request.body === 'string' && request.body.trim().startsWith('{')) {
        try {
          body = JSON.parse(request.body);
        } catch (e) {
          console.error('Error parsing body string:', e);
        }
      }
    }

    const { email, password } = body || {};

    // Validate required fields
    if (!email || !password) {
      return response.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: {
          email: email ? [] : ['Email is required'],
          password: password ? [] : ['Password is required']
        },
        receivedBody: body // Helpful for debugging
      });
    }

    // Forward request to Render backend with explicit headers
    const backendUrl = process.env.BACKEND_URL || 'https://final-platform-eshro.onrender.com';
    
    const backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Serverless-Function'
      },
      body: JSON.stringify({ 
        email: email.toLowerCase().trim(), 
        password: password 
      })
    });

    const responseData = await backendResponse.json();

    // Ensure response has a message field if not present, to avoid "Login failed from server" generic message
    if (responseData && !responseData.message && responseData.error) {
      responseData.message = responseData.error;
    } else if (responseData && !responseData.message && !responseData.success) {
      responseData.message = 'فشل تسجيل الدخول: البريد الإلكتروني أو كلمة المرور غير صحيحة';
    }

    // Return the backend response
    return response.status(backendResponse.status).json(responseData);
  } catch (err) {
    return response.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'تعذر الاتصال بخادم المصادقة: ' + err.message
    });
  }
}
