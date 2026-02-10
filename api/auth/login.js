export default async function handler(request, response) {
  // Only allow POST
  if (request.method !== 'POST') {
    return response.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email, password } = request.body;

    // Validate required fields
    if (!email || !password) {
      return response.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: {
          email: email ? [] : ['Email is required'],
          password: password ? [] : ['Password is required']
        }
      });
    }

    // Forward request to Render backend
    const backendUrl = process.env.BACKEND_URL || 'https://final-platform-eshro.onrender.com';
    
    const backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const responseData = await backendResponse.json();

    // Return the backend response
    return response.status(backendResponse.status).json(responseData);
  } catch {
    return response.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to connect to authentication service'
    });
  }
}
