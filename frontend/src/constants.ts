export const BRAND_NAME = {
  en: "Thara Nufa Group",
  ar: " ثرا نوفا"
};

export const NAV_LINKS = [
  { id: "home",        en: "Home",       ar: "الرئيسية" },
  { id: "services",    en: "Services",   ar: "الخدمات" },
  { id: "faq",         en: "FAQ",        ar: "الأسئلة الشائعة" },
  { id: "about",       en: "About Us",   ar: "من نحن" },
];

export const HERO_CONTENT = {
  en: {
    badge: "Strategic Enterprise Partner",
    title: "Engineering the Future of ",
    titleAccent: "Institutional Growth.",
    description: "Thara Nufa Group provides high-end digital and operational transformation designed for global enterprises and institutional excellence.",
    ctaPrimary: "Start Your Journey",
    ctaSecondary: "View Portfolio"
  },
  ar: {
    badge: "شريك استراتيجي للمؤسسات الكبرى",
    title: "هندسة المستقبل لـ ",
    titleAccent: "النمو المؤسسي.",
    description: "تقدم مجموعة ثرا نوفا تحولاً رقمياً وتشغيلياً رفيع المستوى مصمم للمؤسسات الكبرى والريادة المؤسسية المستدامة.",
    ctaPrimary: "ابدأ رحلتك",
    ctaSecondary: "سابقة أعمالنا"
  }
};

export const PORTFOLIO = {
  en: {
    title: "Strategic Impact",
    subtitle: "Selected Portfolio",
    projects: [
      {
        id: "logistics-hub",
        title: "Smart Logistics Hub",
        category: "Supply Chain",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
        description: "A fully integrated smart logistics hub leveraging AI-driven route optimization and real-time inventory management across 14 distribution centers in Saudi Arabia.",
        tags: ["AI Routing", "IoT", "Cloud", "SAP"],
        result: "Reduced distribution costs by 34% within 8 months"
      },
      {
        id: "hospitality-cloud",
        title: "Hospitality Cloud",
        category: "Digital Infrastructure",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
        description: "A cloud-native hospitality platform managing 3,000+ rooms across premium properties in Makkah, Madinah, and Riyadh with smart check-in and dynamic pricing.",
        tags: ["Cloud Native", "Mobile", "Revenue Management", "API"],
        result: "Increased hotel revenue by 28% in the first 6 months"
      },
      {
        id: "urban-expansion",
        title: "Urban Expansion",
        category: "Construction",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
        description: "Large-scale urban development spanning 420,000 sqm of mixed-use space in Riyadh's northern expansion zone, delivered on time and under budget.",
        tags: ["BIM", "Civil Engineering", "Project Management", "Sustainability"],
        result: "Completed 3 weeks ahead of schedule with 12% budget savings"
      }
    ]
  },
  ar: {
    title: "الأثر الاستراتيجي",
    subtitle: "مشاريعنا المختارة",
    projects: [
      {
        id: "logistics-hub",
        title: "مركز الخدمات اللوجستية الذكي",
        category: "سلاسل الإمداد",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
        description: "مركز لوجستي ذكي متكامل يستخدم الذكاء الاصطناعي لتحسين مسارات التوزيع وإدارة المخزون في الوقت الفعلي عبر 14 مركز توزيع في المملكة العربية السعودية.",
        tags: ["AI Routing", "IoT", "Cloud", "SAP"],
        result: "خفّضنا تكاليف التوزيع بنسبة 34% خلال 8 أشهر"
      },
      {
        id: "hospitality-cloud",
        title: "سحابة الضيافة",
        category: "البنية التحتية الرقمية",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
        description: "منصة ضيافة سحابية تدير أكثر من 3000 غرفة في فنادق فاخرة بمكة المكرمة والمدينة المنورة والرياض مع نظام تسجيل وصول ذكي وتسعير ديناميكي.",
        tags: ["Cloud Native", "Mobile", "Revenue Management", "API"],
        result: "زيادة إيرادات الفندق بنسبة 28% خلال أول 6 أشهر"
      },
      {
        id: "urban-expansion",
        title: "التوسع العمراني",
        category: "المقاولات والإنشاءات",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
        description: "مشروع تطوير عمراني ضخم يمتد على 420,000 متر مربع من الفضاء متعدد الاستخدامات في منطقة التوسع الشمالي لمدينة الرياض، سُلّم في الوقت المحدد وضمن الميزانية.",
        tags: ["BIM", "Civil Engineering", "Project Management", "Sustainability"],
        result: "إنجاز المشروع قبل الموعد المحدد بـ 3 أسابيع وبتوفير 12% من الميزانية"
      }
    ]
  }
};

export const BOOKING_SERVICES = [
  {
    id: "events",
    icon: "Calendar",
    en: {
      title: "Conference & Event Booking",
      description: "Organizing state-of-the-art corporate events and international summits with full technical support.",
      benefits: [
        "End-to-end logistics & catering",
        "High-tech AV & simultaneous translation",
        "Protocol & VIP management",
        "Digital registration & attendee tracking"
      ],
      caseStudy: {
        client: "MENA Innovation Forum",
        result: "Managed a 3-day summit for 2,000+ delegates with zero logistical delays and 98% satisfaction rating."
      }
    },
    ar: {
      title: "حجز المؤتمرات والفعاليات",
      description: "تنظيم فعاليات الشركات الكبرى والقمم الدولية بأعلى المعايير التقنية والتنظيمية.",
      benefits: [
        "إدارة الخدمات اللوجستية والتموين المتكاملة",
        "أنظمة صوتية ومرئية وترجمة فورية متطورة",
        "إدارة البروتوكول وكبار الشخصيات",
        "التسجيل الرقمي وتتبع الحضور"
      ],
      caseStudy: {
        client: "منتدى الابتكار في الشرق الأوسط",
        result: "إدارة قمة لمدة ٣ أيام لأكثر من ٢٠٠٠ مندوب دون أي تأخير لوجستي وبنسبة رضا بلغت ٩٨٪."
      }
    }
  },
  {
    id: "hotels",
    icon: "Hotel",
    en: {
      title: "Hospitality & Room Booking",
      description: "Premium stays and dedicated executive suites in the Kingdom's key cities, including Makkah and Madinah.",
      benefits: [
        "Exclusive inventory in Makkah & Madinah",
        "Dedicated corporate concierge",
        "Group booking & logistics management",
        "Luxury executive suite availability"
      ],
      caseStudy: {
        client: "Global Haj Group",
        result: "Secured and managed 500+ premium rooms during peak season with specialized transport services."
      }
    },
    ar: {
      title: "خدمات الضيافة والفنادق",
      description: "إقامة فاخرة وأجنحة تنفيذية مخصصة في المدن المقدسة والمدن الرئيسية بالمملكة.",
      benefits: [
        "مخزون حصري من الغرف في مكة والمدينة",
        "خدمة كونسيرج مخصصة للشركات",
        "إدارة الحجوزات الجماعية والخدمات اللوجستية",
        "توفر أجنحة تنفيذية فاخرة"
      ],
      caseStudy: {
        client: "مجموعة الحج العالمية",
        result: "تأمين وإدارة أكثر من ٥٠٠ غرفة متميزة خلال مواسم الذروة مع خدمات نقل متخصصة."
      }
    }
  },
  {
    id: "construction",
    icon: "HardHat",
    en: {
      title: "Construction Services",
      description: "Leveraging expertise in large-scale infrastructure and modern architectural development.",
      benefits: [
        "Project management from design to delivery",
        "Sustainable and LEED-certified building",
        "Infrastructure development for smart cities",
        "Quality control & safety compliance"
      ],
      caseStudy: {
        client: "Urban Development Authority",
        result: "Delivered a multi-use commercial complex 2 months ahead of schedule with zero safety incidents."
      }
    },
    ar: {
      title: "خدمات المقاولات والإنشاءات",
      description: "تمكين مشاريع البنية التحتية الضخمة والتطوير المعماري الحديث بأحدث المعايير الهندسية.",
      benefits: [
        "إدارة المشاريع من التصميم حتى التسليم",
        "بناء مستدام ومعتمد بشهادة LEED",
        "تطوير البنية التحتية للمدن الذكية",
        "مراقبة الجودة والامتثال لمعايير السلامة"
      ],
      caseStudy: {
        client: "هيئة التطوير العمراني",
        result: "تسليم مجمع تجاري متعدد الاستخدامات قبل شهرين من الموعد المحدد دون وقوع أي حوادث سلامة."
      }
    }
  },
  {
    id: "logistics",
    icon: "Truck",
    en: {
      title: "Logistics & Transport",
      description: "Smart supply chain solutions and high-capacity global transport operations.",
      benefits: [
        "Global freight forwarding & customs",
        "IoT-enabled real-time fleet tracking",
        "Optimized warehouse management",
        "Last-mile delivery excellence"
      ],
      caseStudy: {
        client: "Continental E-commerce",
        result: "Optimized delivery routes reducing fuel consumption by 15% and improving delivery times by 20%."
      }
    },
    ar: {
      title: "الخدمات اللوجستية والنقل",
      description: "حلول سلاسل الإمداد الذكية وعمليات الشحن والنقل الدولي عالية السعة.",
      benefits: [
        "الشحن الدولي والتخليص الجمركي",
        "تتبع الأسطول اللحظي المدعوم بإنترنت الأشياء",
        "إدارة المخازن المطورة",
        "التميز في خدمات التوصيل النهائي"
      ],
      caseStudy: {
        client: "كونتيننتال للتجارة الإلكترونية",
        result: "تحسين مسارات التوصيل مما أدى لخفض استهلاك الوقود بنسبة ١٥٪ وتحسين مواعيد التسليم بنسبة ٢٠٪."
      }
    }
  }
];

export const SERVICES = [
  {
    id: "logistics",
    icon: "Truck",
    en: { title: "Transport & Logistics" },
    ar: { title: "خدمات النقل والشحن" }
  },
  {
    id: "events",
    icon: "Calendar",
    en: { title: "Events & Conferences" },
    ar: { title: "تنظيم المؤتمرات والفعاليات" }
  },
  {
    id: "hospitality",
    icon: "Hotel",
    en: { title: "Hospitality & Hotels" },
    ar: { title: "خدمات الضيافة والفنادق" }
  },
  {
    id: "construction",
    icon: "HardHat",
    en: { title: "Construction & Contracting" },
    ar: { title: "خدمات المقاولات والبناء" }
  },
  {
    id: "customer-service",
    icon: "Headphones",
    en: { title: "Customer Support" },
    ar: { title: "خدمات العملاء والدعم" }
  },
  {
    id: "training",
    icon: "GraduationCap",
    en: { title: "Training & Capacity Building" },
    ar: { title: "التدريب وبناء الكفاءات" }
  },
  {
    id: "research",
    icon: "BookOpen",
    en: { title: "Research & Info Center" },
    ar: { title: "مركز البحوث والمعلومات" }
  }
];

export const METHODOLOGY = {
  en: {
    title: "Our Proven Framework",
    subtitle: "Precision Delivery",
    steps: [
      { id: "1", title: "Assessment", desc: "Rigorous audit of existing operational and digital landscape." },
      { id: "2", title: "Blueprint", desc: "Designing high-performance, future-ready architectures." },
      { id: "3", title: "Integration", desc: "Phased deployment with zero mission-critical downtime." },
      { id: "4", title: "Optimization", desc: "Data-driven iterative refinement for lasting impact." }
    ]
  },
  ar: {
    title: "منهجية العمل المعتمدة",
    subtitle: "دقة التنفيذ",
    steps: [
      { id: "١", title: "التقييم الشامل", desc: "تدقيق صارم للمشهد التشغيلي والرقمي الحالي للمؤسسة." },
      { id: "٢", title: "المخطط الرئيسي", desc: "تصميم بنية تحتية عالية الأداء وجاهزة لمتطلبات المستقبل." },
      { id: "٣", title: "التكامل الفني", desc: "تنفيذ مرحلي يضمن استمرارية الأعمال دون انقطاع." },
      { id: "٤", title: "التحسين المستمر", desc: "تطوير دوري مدعوم بالبيانات لضمان الأثر المستدام." }
    ]
  }
};

export const TESTIMONIALS = {
  en: {
    title: "Client Voices",
    subtitle: "Trusted by Industry Leaders",
    items: [
      {
        name: "Ahmed Al-Saud",
        role: "CEO, Desert Logistics",
        content: "Thara Nufa transformed our data infrastructure, leading to a 30% increase in operational efficiency.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"
      },
      {
        name: "Sarah Parker",
        role: "Operations Director, Mena Summit",
        content: "Exceptional event management. They handled every detail of our international forum with precision.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
      },
      {
        name: "Mohammed Ibrahim",
        role: "Head of Digital, Urban Dev",
        content: "Their strategic advisory was critical for our smart city roadmap. True partners in innovation.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
      }
    ]
  },
  ar: {
    title: "أصدقاء النجاح",
    subtitle: "ثقة قادة الصناعة",
    items: [
      {
        name: "أحمد آل سعود",
        role: "الرئيس التنفيذي، ديزرت لوجستيكس",
        content: "أحدثت ثرا نوفا تحولاً جذرياً في بنيتنا التحتية للبيانات، مما أدى إلى زيادة كفاءة العمليات بنسبة ٣٠٪.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"
      },
      {
        name: "سارة باركر",
        role: "مديرة العمليات، منتدى مينا",
        content: "إدارة فعاليات استثنائية. تعاملوا مع كل تفاصيل منتدانا الدولي بدقة متناهية.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
      },
      {
        name: "محمد إبراهيم",
        role: "رئيس الخدمات الرقمية، أربان ديف",
        content: "كانت استشاراتهم الاستراتيجية حاسمة لخارطة طريق مدينتنا الذكية. شركاء حقيقيون في الابتكار.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
      }
    ]
  }
};

// ── Booking status stages (5 stages shown in UserDashboard)
export const BOOKING_STATUS_STAGES = [
  {
    key: 'PENDING_REVIEW',
    ar: 'انتظار',
    en: 'Waiting',
    icon: 'Clock',
  },
  {
    key: 'UNDER_REVIEW',
    ar: 'تواصل',
    en: 'Contact',
    icon: 'Phone',
  },
  {
    key: 'CONFIRMED',
    ar: 'مراجعة',
    en: 'Review',
    icon: 'Search',
  },
  {
    key: 'IN_PROGRESS',
    ar: 'تنفيذ',
    en: 'In Progress',
    icon: 'HardHat',
  },
  {
    key: 'COMPLETED',
    ar: 'الاكتمال',
    en: 'Completed',
    icon: 'CheckCircle',
  },
];

// Status order for progress calculation
export const STATUS_ORDER = [
  'PENDING_REVIEW',
  'UNDER_REVIEW',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
];

// ── FAQ Items ──────────────────────────────────────────────────────────────
export const FAQ_ITEMS = [
  {
    ar: { q: 'ما هي خدمات ثرا نوفا؟', a: 'تقدم ثرا نوفا مجموعة متكاملة من الخدمات تشمل: المقاولات والبناء، التشطيبات الداخلية والخارجية، تنظيم الفعاليات والمؤتمرات، والاستشارات الهندسية وإدارة المشاريع.' },
    en: { q: 'What services does Thara Nufa offer?', a: 'Thara Nufa offers a full range of services including: contracting and construction, interior and exterior finishing, events and conference management, and engineering consultancy and project management.' },
  },
  {
    ar: { q: 'كيف يمكنني حجز خدمة؟', a: 'يمكنك حجز أي خدمة من خلال النقر على الخدمة المطلوبة وملء نموذج الحجز. سيتواصل معك فريقنا خلال 24 ساعة لتأكيد الحجز وتقديم عرض السعر.' },
    en: { q: 'How can I book a service?', a: 'You can book any service by clicking on the desired service and filling out the booking form. Our team will contact you within 24 hours to confirm the booking and provide a price offer.' },
  },
  {
    ar: { q: 'ما هي مراحل تنفيذ المشروع؟', a: 'يمر كل مشروع بخمس مراحل واضحة: استلام الطلب، والتحدث مع خدمة العملاء، والمراجعة والتقييم، والتنفيذ، وأخيراً الاكتمال. يمكنك متابعة حالة طلبك في أي وقت من خلال لوحة التحكم الخاصة بك.' },
    en: { q: 'What are the project execution stages?', a: 'Every project goes through 5 clear stages: receiving the request, speaking with customer service, review and evaluation, execution, and finally completion. You can track your request status at any time from your dashboard.' },
  },
  {
    ar: { q: 'هل يمكنني تتبع حالة طلبي؟', a: 'نعم، بمجرد تسجيل الدخول إلى حسابك ستجد في لوحة التحكم قسم "حجوزاتي" حيث تظهر جميع طلباتك مع مؤشر مراحل تنفيذي واضح يُحدَّث في الوقت الفعلي.' },
    en: { q: 'Can I track my request status?', a: 'Yes, once you log in to your account, you will find in your dashboard a "My Bookings" section where all your requests appear with a clear real-time execution stage indicator.' },
  },
  {
    ar: { q: 'كيف يتم احتساب التكلفة؟', a: 'تختلف التكلفة بحسب نوع الخدمة والحجم والمتطلبات الخاصة بكل مشروع. بعد مراجعة طلبك، يتواصل معك فريقنا لتقديم عرض سعر مفصل ومخصص.' },
    en: { q: 'How is the cost calculated?', a: 'The cost varies depending on the type of service, size, and specific requirements of each project. After reviewing your request, our team will contact you to provide a detailed and customized price offer.' },
  },
  {
    ar: { q: 'هل تقدمون خدماتكم خارج الرياض؟', a: 'نعم، نقدم خدماتنا في جميع أنحاء المملكة العربية السعودية. لدينا فرق متخصصة في الرياض وجدة والدمام وغيرها من المدن الكبرى.' },
    en: { q: 'Do you provide services outside Riyadh?', a: 'Yes, we provide our services throughout Saudi Arabia. We have specialized teams in Riyadh, Jeddah, Dammam, and other major cities.' },
  },
  {
    ar: { q: 'ما هي ضمانات جودة أعمالكم؟', a: 'نلتزم بأعلى معايير الجودة في جميع مشاريعنا. نقدم ضمانات على جميع الأعمال المنجزة، ونحرص على استخدام أفضل المواد وأحدث التقنيات لضمان رضا عملائنا.' },
    en: { q: 'What are your quality guarantees?', a: 'We are committed to the highest quality standards in all our projects. We offer warranties on all completed work and ensure the use of the best materials and latest technologies to guarantee customer satisfaction.' },
  },
  {
    ar: { q: 'كيف يمكنني التواصل مع فريق الدعم؟', a: 'يمكنك التواصل معنا من خلال نموذج الحجز، أو الاتصال بنا مباشرة عبر الأرقام الموجودة في قسم التواصل. فريق خدمة العملاء متاح على مدار الأسبوع.' },
    en: { q: 'How can I contact the support team?', a: 'You can contact us through the booking form, or call us directly using the numbers in the contact section. The customer service team is available throughout the week.' },
  },
];
