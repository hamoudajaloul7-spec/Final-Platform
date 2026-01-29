#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def calculate_badge(product):
    """حساب الشارة بناءً على بيانات المنتج"""
    quantity = product.get('quantity', 0)
    views = product.get('views', 0)
    likes = product.get('likes', 0)
    orders = product.get('orders', 0)
    original_price = product.get('originalPrice', 0)
    price = product.get('price', 0)
    
    if quantity <= 0:
        return 'غير متوفر'
    
    if quantity > 0 and quantity < 5:
        return 'متوفر'
    
    discount_percent = ((original_price - price) / original_price * 100) if original_price > 0 else 0
    if original_price > price and discount_percent > 10:
        return 'تخفيضات'
    
    if orders > 100 and likes > 200:
        return 'مميزة'
    
    if orders > 100:
        return 'أكثر مبيعاً'
    
    if likes > 200:
        return 'أكثر إعجاباً'
    
    if orders > 50:
        return 'أكثر طلباً'
    
    if views > 400:
        return 'أكثر مشاهدة'
    
    return 'جديد'

pretty_products = [
    {
        "id": 3001,
        "storeId": 3,
        "name": "عطر MEGARA للجنسين",
        "description": "عطر MEGARA للجنسين هو عطر مميز بتركيبة فريدة تجمع بين الروائح الشرقية والغربية، مما يجعله مناسباً للرجال والنساء على حد سواء. يتميز بثباتية عالية تدوم طوال اليوم، ويحتوي على تركيبة eau de Perfume مركزة تجعل منه خياراً مثالياً للمناسبات الخاصة واليومية.",
        "price": 165,
        "originalPrice": 195,
        "images": ["/assets/real-stores/pretty/image3.jpg"],
        "image": "/assets/real-stores/pretty/image3.jpg",
        "sizes": ["50ml"],
        "availableSizes": ["50ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.8,
        "reviews": 45,
        "views": 189,
        "likes": 98,
        "orders": 23,
        "quantity": 12,
        "category": "عطور",
        "inStock": True
    },
    {
        "id": 3002,
        "storeId": 3,
        "name": "عطر CELEBRITY للرجال",
        "description": "عطر رجالي خشبي يجمع بين عطرين الافتتاحية عطر قرلان لانستنت وبعد 10 دقائق يشبه عطر ديور اوم انتنس عطر ذو كاريزما قوية للرجل العصري ذو شخصية قوية مناسب لفصل الشتاء والربيع",
        "price": 200,
        "originalPrice": 230,
        "images": ["/assets/real-stores/pretty/image5.jpg", "/assets/real-stores/pretty/image13.jpg"],
        "image": "/assets/real-stores/pretty/image5.jpg",
        "sizes": ["100ml"],
        "availableSizes": ["100ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.7,
        "reviews": 67,
        "views": 234,
        "likes": 145,
        "orders": 34,
        "quantity": 8,
        "category": "عطور رجالية",
        "inStock": True
    },
    {
        "id": 3003,
        "storeId": 3,
        "name": "عطر ابن العز للرجال",
        "description": "عطر رجالي مكون من خشب الصندل وفوحان زهرة الياسمين عطر ابن العز يدوم بمجرد 10 دقائق يشبه عطر دافيدوف لايت عطر ذو كاريزما قوية للرجل العصري ذو شخصية قوية مناسب لفصل الشتاء والربيع",
        "price": 95,
        "originalPrice": 135,
        "images": ["/assets/real-stores/pretty/image4.jpg", "/assets/real-stores/pretty/image10.jpg"],
        "image": "/assets/real-stores/pretty/image4.jpg",
        "sizes": ["100ml"],
        "availableSizes": ["100ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.6,
        "reviews": 89,
        "views": 267,
        "likes": 123,
        "orders": 45,
        "quantity": 15,
        "category": "عطور رجالية",
        "inStock": True
    },
    {
        "id": 3004,
        "storeId": 3,
        "name": "عطر Candid للرجال",
        "description": "عطر attractive للرجال TADangel Attractive Pour Homme للرجال هو العطر الليلي المثالي. تخلق رائحتها الدافئة والحسية من الخشب والتوابل والجلود هالة مغرية تجعلك تشعر بأنك لا تقاوم. استمتع بأمسية لا تنسى مع هذا العطر الآسر حقا. مقدمة العطر : الفلفل الوردي ، عنبر، الروائح الوسطى: لافندر، Olibanum ، حمضيات المكونات الأساسية: الفانيليا، ، تونيك",
        "price": 49.95,
        "originalPrice": 135,
        "images": ["/assets/real-stores/pretty/image6.png", "/assets/real-stores/pretty/image15.jpg"],
        "image": "/assets/real-stores/pretty/image6.png",
        "sizes": ["100ml"],
        "availableSizes": ["100ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.5,
        "reviews": 56,
        "views": 198,
        "likes": 87,
        "orders": 28,
        "quantity": 20,
        "category": "عطور رجالية",
        "inStock": True
    },
    {
        "id": 3005,
        "storeId": 3,
        "name": "عطر PLEIN FATALE ROSE للنساء",
        "description": "عطر بلين فاتال روزيه الجذاب والحسي، هو عطر فاتال الجديد للمرأة التي تفضل أن تكون رائدة في حياتها. إنه سحر المجهول، وغموض الغموض، وقوة الأنوثة النقية التي تنبض بالحياة مع كل رشة عطر زهري - فواكه للنساء. هذا عطر جديد صدر عام 2023 افتتاحية العطر الليتشي, الكشمش الأسود والبرتقال البرازيلي; قلب العطر براعم الورد وياسمين سامباك; قاعدة العطر تتكون من الأمبروكسان, خشب الصندل والعرعر.",
        "price": 295,
        "originalPrice": 320,
        "images": ["/assets/real-stores/pretty/image14.jpg"],
        "image": "/assets/real-stores/pretty/image14.jpg",
        "sizes": ["90ml"],
        "availableSizes": ["90ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.9,
        "reviews": 34,
        "views": 145,
        "likes": 78,
        "orders": 19,
        "quantity": 5,
        "category": "عطور نسائية",
        "inStock": True
    },
    {
        "id": 3006,
        "storeId": 3,
        "name": "عطر Girl Of Now ELIE SAAB 90ml",
        "description": "يتميز العطر بتركيبة مركزة ذات ثباتية عالية بلمسة شرقية زهرية للنساء اللواتي يتلألأن بالسعادة، يفتتح العطر بنوتات الأناناس، الفستق، الكمثرى واليوسفي وتتدرج الى قلب بنوتات الياسمين، براعم البرتقال، الأيلنغ واللوز المر ثم يختتم العطر بقاعدة عطرية خفيفة من زهور السوسن، الفانيلا والباتشولي",
        "price": 445.2,
        "originalPrice": 530,
        "images": ["/assets/real-stores/pretty/image11.jpg", "/assets/real-stores/pretty/image18.jpg"],
        "image": "/assets/real-stores/pretty/image11.jpg",
        "sizes": ["90ml"],
        "availableSizes": ["90ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.8,
        "reviews": 67,
        "views": 234,
        "likes": 145,
        "orders": 38,
        "quantity": 10,
        "category": "عطور نسائية",
        "inStock": True
    },
    {
        "id": 3007,
        "storeId": 3,
        "name": "عطر Girl Of Now ELIE SAAB 50ml",
        "description": "ايلي صعب جيرل اوف ناو فوريفر عطر نسائي لا نهاية له وفريد من نوعه، رائحته رقيقة وجميلة بمزيج الأزهار الناعمة مع الفواكه الحيوية، يناسب المرأة العصرية الشابة التي ترغب في الإثارة والإغراء وجذب الانتباه إليها فيضيف لها لمسات من الأناقة والجاذبية لا تنتهي",
        "price": 364.5,
        "originalPrice": 380,
        "images": ["/assets/real-stores/pretty/image1.jpg", "/assets/real-stores/pretty/image29.jpg"],
        "image": "/assets/real-stores/pretty/image1.jpg",
        "sizes": ["50ml"],
        "availableSizes": ["50ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.7,
        "reviews": 45,
        "views": 189,
        "likes": 98,
        "orders": 26,
        "quantity": 7,
        "category": "عطور نسائية",
        "inStock": True
    },
    {
        "id": 3008,
        "storeId": 3,
        "name": "عطر Versace Eros Eau De Toilette رجال",
        "description": "يشع هالة آسرة: حسية على البشرة، وذكورية مطمئنة. هذا العطر يجسد المغوي المنتصر والمبهر. هالة مضيئة ذات نضارة كثيفة، نابضة وحيوية بشكل استثنائي، يتم الحصول عليها من مزيج أوراق النعناع، قشر الليمون",
        "price": 373,
        "originalPrice": 410,
        "images": ["/assets/real-stores/pretty/image2.jpg", "/assets/real-stores/pretty/image16.jpg"],
        "image": "/assets/real-stores/pretty/image2.jpg",
        "sizes": ["100ml"],
        "availableSizes": ["100ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.8,
        "reviews": 78,
        "views": 267,
        "likes": 156,
        "orders": 42,
        "quantity": 9,
        "category": "عطور رجالية",
        "inStock": True
    },
    {
        "id": 3009,
        "storeId": 3,
        "name": "عطر Especially Escada Escada",
        "description": "وهو ينفرد عن سواه بقوام ناعم ومخملي يتمحور حول توليفة من شذى الورود. ويمثل عبق الورد ونضارته ونداوته قلب العطر، ويتكامل مع نفحات مائية من ندى الصباح وحسية زهور اليلانغ. وتستهل السيمفونية الشذية بنفحات من الكمثرى وبذور العنبر تسهم في تعزيز الحس النضر الذي يتسم به العطر، وتتحول إلى نفحات ختامية خفيفة من المسك",
        "price": 285,
        "originalPrice": 310,
        "images": ["/assets/real-stores/pretty/image8.jpg", "/assets/real-stores/pretty/image17.jpg"],
        "image": "/assets/real-stores/pretty/image8.jpg",
        "sizes": ["50ml"],
        "availableSizes": ["50ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.7,
        "reviews": 56,
        "views": 198,
        "likes": 89,
        "orders": 31,
        "quantity": 14,
        "category": "عطور نسائية",
        "inStock": True
    },
    {
        "id": 3010,
        "storeId": 3,
        "name": "عطر My Burberry Blush",
        "description": "هو أحدث العطور النسائية لبيت الأزياء البريطاني العريق العطر الجديد استوحى رقته من رقة وتمايل أزهار الصيف عند هبوب نسمات المساء وجاء بطابع زهري خلاب لقد أبدع الخبير العطري الشهير في خلط مكونات هذا العطر الخلاب إذ قام بافتتاح العطر برائحة الرمان والليمون, ثم زاد جرعة الرقة من خلال قلب العطر المفعم برائحة بتلات الورد ونبات ابرة الراعي مع التفاح الأخضر ثم ختم بقاعدة عطرية من الياسمين مع الوستارية",
        "price": 488,
        "originalPrice": 530,
        "images": ["/assets/real-stores/pretty/image12.jpg", "/assets/real-stores/pretty/image9.jpg"],
        "image": "/assets/real-stores/pretty/image12.jpg",
        "sizes": ["90ml"],
        "availableSizes": ["90ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.9,
        "reviews": 43,
        "views": 167,
        "likes": 98,
        "orders": 25,
        "quantity": 6,
        "category": "عطور نسائية",
        "inStock": True
    },
    {
        "id": 3011,
        "storeId": 3,
        "name": "عطر BURBERRY HERO",
        "description": "يستكشف عطر بربري هيرو الرجالي جانبًا بطوليًّا جديدًا يتسم بالجاذبية: شجاعة تقبّل المرء لذاته. وهو يروي قصة رجل يخوض رحلة لاستكشاف ذاته. حيث روح الاستكشاف والإحساس الداخلي لديه. تفيض طاقته بأحاسيس مرهفة تتجلى في حضور الحصان بوصفه مخلوقًا هائلًا يعبّر عن قوّة بطلنا يحتوي العطر على ثلاث زيوت من خشب الأرز الدافئ كقاعدة عطرية مُميزة، وينتهي برائحة منعشة ومتألقة. يفتتح العطر برائحة إبر الصنوبر النابضة بالحيوية مع البنزوين والبخور، ليصنع مزيجًا قويًا من الإحساس العميق",
        "price": 464,
        "originalPrice": 540,
        "images": ["/assets/real-stores/pretty/image27.jpg", "/assets/real-stores/pretty/image28.jpg"],
        "image": "/assets/real-stores/pretty/image27.jpg",
        "sizes": ["100ml"],
        "availableSizes": ["100ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.8,
        "reviews": 67,
        "views": 234,
        "likes": 145,
        "orders": 38,
        "quantity": 11,
        "category": "عطور رجالية",
        "inStock": True
    },
    {
        "id": 3012,
        "storeId": 3,
        "name": "عطر Costume National Scent Intense",
        "description": "يعبر عطر كوستوم عن الاناقة والجاذبية والرجولة المثالية عطر جذاب جدا مركز جدا وبثبات عظيم أيضا عطر تفاعلي مع جميع الأجواء بتركيبه من الباتشولي التي تجعل العطر هوا استفراد كامل لكل من حولك هوا جاذبية وسحر العنبر ليجعلك انت مصدر الفضول مكونات العطر افتتاحية العطر الشاي, القرفة, التفاح والبرغوث; قلب العطر الكركدية, الياسمين والدافانا قاعدة العطر تتكون من العنبر الكريستالي, العنبر, خشب الصندل, الباتشولي, الجلود واللبان.",
        "price": 451,
        "originalPrice": 485,
        "images": ["/assets/real-stores/pretty/image19.jpg", "/assets/real-stores/pretty/image23.jpg"],
        "image": "/assets/real-stores/pretty/image19.jpg",
        "sizes": ["100ml"],
        "availableSizes": ["100ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.7,
        "reviews": 52,
        "views": 189,
        "likes": 98,
        "orders": 29,
        "quantity": 13,
        "category": "عطور رجالية",
        "inStock": True
    },
    {
        "id": 3013,
        "storeId": 3,
        "name": "عطر Hugo Intense",
        "description": "عطر شرقي - فوچير للرجال . هذا عطر جديد Hugo Intense صدر عام 2023. افتتاحية العطر التفاح الأحمر, القرفة, الليم - الزيزفون والجريب فروت الأحمر; قلب العطر الزعتر الأحمر وإبره الراعي; قاعدة العطر تتكون من خشب الأرز, الجلود والباتشولي",
        "price": 449,
        "originalPrice": 510,
        "images": ["/assets/real-stores/pretty/image24.jpg", "/assets/real-stores/pretty/image21.jpg"],
        "image": "/assets/real-stores/pretty/image24.jpg",
        "sizes": ["125ml"],
        "availableSizes": ["125ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.6,
        "reviews": 78,
        "views": 245,
        "likes": 134,
        "orders": 41,
        "quantity": 4,
        "category": "عطور رجالية",
        "inStock": True
    },
    {
        "id": 3014,
        "storeId": 3,
        "name": "عطر Pasha De Cartier Perfume",
        "description": "هو عطر شرقي فوجير مصمم خصيصًا للرجال، يعكس الأناقة والفخامة. أُطلق هذا العطر في عام 2020 من قبل دار الأزياء الفرنسي العريق Cartier، ويتميز بتركيبته الغنية التي تجمع بين النفحات الشرقية والخشبية، مما يجعله خيارًا مثاليًا للرجل العصري. عطر كارتير باشا بارفيوم هو خيار مثالي للرجل الباحث عن التميز والجاذبية، حيث يضفي عليه لمسة من الثقة والأناقة تدوم طوال اليوم",
        "price": 538,
        "originalPrice": 560,
        "images": ["/assets/real-stores/pretty/image22.jpg", "/assets/real-stores/pretty/image20.jpg"],
        "image": "/assets/real-stores/pretty/image22.jpg",
        "sizes": ["125ml"],
        "availableSizes": ["125ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.9,
        "reviews": 34,
        "views": 156,
        "likes": 78,
        "orders": 19,
        "quantity": 3,
        "category": "عطور رجالية",
        "inStock": True
    },
    {
        "id": 3015,
        "storeId": 3,
        "name": "عطر Nomade Naturelle Chloé",
        "description": "عطر جرجيوس من مايكل كورس تم اصداره عام 2021 تزهر بشكل رائع مع نوع جديد تمامًا من الثقة. إنه مزيج من التفاؤل الناجم عن باقة الزهور البيضاء الزاهية ولمسة من رائحة التبغ والرفاهية المريحة المعززة بروائح خشبية قوية افتتاحية العطر اليوسفي, المر والبرغموت; قلب العطر الإيلنغ, زهر البرتقال, ياسمين سامباك والسوسن; قاعدة العطر تتكون من التبغ, العنبر, خشب الأرز الأطلسي, اللبان, خشب الصندل والتونكا",
        "price": 387,
        "originalPrice": 430,
        "images": ["/assets/real-stores/pretty/image25.jpg", "/assets/real-stores/pretty/image26.jpg"],
        "image": "/assets/real-stores/pretty/image25.jpg",
        "sizes": ["75ml"],
        "availableSizes": ["75ml"],
        "colors": [{"name": "شفاف", "value": "#FFFFFF"}],
        "rating": 4.8,
        "reviews": 56,
        "views": 198,
        "likes": 112,
        "orders": 33,
        "quantity": 9,
        "category": "عطور نسائية",
        "inStock": True
    }
]

def load_json_file(path):
    """تحميل ملف JSON"""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ خطأ في تحميل {path}: {e}")
        return None

def save_json_file(path, data):
    """حفظ ملف JSON"""
    try:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ تم حفظ: {path}")
        return True
    except Exception as e:
        print(f"❌ خطأ في الحفظ {path}: {e}")
        return False

def main():
    """البرنامج الرئيسي"""
    print("🚀 بدء ملء متجر بريتي بالمنتجات...\n")
    
    pretty_path = 'public/assets/pretty/store.json'
    pretty_dist_path = 'dist/assets/pretty/store.json'
    
    store_data = load_json_file(pretty_path)
    if store_data is None:
        print("❌ لم يتمكن من تحميل ملف المتجر")
        return
    
    print(f"📋 جاري معالجة {len(pretty_products)} منتج لبريتي...")
    
    for product in pretty_products:
        badge = calculate_badge(product)
        product['badge'] = badge
        product['tags'] = [badge]
    
    store_data['products'] = pretty_products
    
    if save_json_file(pretty_path, store_data):
        try:
            with open(pretty_dist_path, 'w', encoding='utf-8') as f:
                json.dump(store_data, f, ensure_ascii=False, indent=2)
            print(f"✅ تم تحديث: {pretty_dist_path}")
        except Exception as e:
            print(f"⚠️  لم يتمكن من تحديث dist: {e}")
    
    badges_summary = {}
    for product in pretty_products:
        badge = product.get('badge', 'جديد')
        badges_summary[badge] = badges_summary.get(badge, 0) + 1
    
    print("\n📊 ملخص الشارات:")
    for badge, count in sorted(badges_summary.items()):
        print(f"   • {badge}: {count}")
    
    print("\n✨ انتهت المعالجة بنجاح!")

if __name__ == '__main__':
    main()
