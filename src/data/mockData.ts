import heroImage from '@/src/assets/images/ritm_hero_cinematic_1790614014544.jpg';
import videoImage from '@/src/assets/images/ritm_video_editing_1790614179865.jpg';
import webImage from '@/src/assets/images/ritm_web_development_1790614191784.jpg';
import mobileImage from '@/src/assets/images/ritm_mobile_app_1790614207000.jpg';
import { ProjectType, ServiceDetail } from '../types';

export { heroImage, videoImage, webImage, mobileImage };

export const SERVICES: ServiceDetail[] = [
  {
    id: 'video',
    titleFa: 'تدوین و پست‌پروداکشن',
    titleEn: 'Video Editing & Post-Production',
    descFa: 'ویرایش حرفه‌ای ویدیو با پریمیر پرو، اصلاح رنگ با استانداردهای سینمایی، طراحی صدا و موشن گرافیک.',
    descEn: 'Professional video editing with Premiere Pro, cinematic color grading, sound design and motion.',
    badge: 'Premier Service',
    featuresFa: ['تدوین تیزر، مستند و فیلم کوتاه', 'اصلاح رنگ و نور تخصصی (Color Grading)', 'میکس و مسترینگ صدا', '۲ مرحله بازبینی رایگان'],
    featuresEn: ['Commercial & documentary editing', 'Cinematic color grading', 'Audio mixing & mastering', '2 free revision rounds'],
    startingPrice: 'از ۳ میلیون تومان',
    deliveryTime: '۳ تا ۷ روز کاری',
    icon: 'Film',
  },
  {
    id: 'web',
    titleFa: 'توسعه وب‌سایت مدرن',
    titleEn: 'Modern Web Development',
    descFa: 'ساخت وب‌سایت‌های پیشرفته شرکتی، فروشگاهی و شخصی با عملکرد بالا، انیمیشن‌های روان و استانداردهای سئو.',
    descEn: 'Building high-performance corporate, e-commerce, and portfolio sites with smooth UI and modern SEO.',
    badge: 'Full Stack',
    featuresFa: ['طراحی اختصاصی و مدرن', 'واکنش‌گرایی کامل (Responsive)', 'سرعت بالا و بهینه‌سازی سئو', 'پنل مدیریت اختصاصی و داینامیک'],
    featuresEn: ['Custom modern design', '100% Mobile responsive', 'High speed & SEO optimization', 'Dedicated dynamic dashboard'],
    startingPrice: 'از ۱۰ میلیون تومان',
    deliveryTime: '۱ تا ۲ هفته کاری',
    icon: 'Code',
  },
  {
    id: 'mobile',
    titleFa: 'اپلیکیشن موبایل',
    titleEn: 'Mobile App Development',
    descFa: 'توسعه اپلیکیشن‌های موبایل کاربردی با تمرکز بر سرعت، سادگی و تجربه کاربری روان و بهینه.',
    descEn: 'Developing intuitive mobile applications focused on efficiency, fast load times, and fluid UX.',
    badge: 'Native & Hybrid',
    featuresFa: ['رابط کاربری مدرن و بصری', 'ذخیره‌سازی اطلاعات آفلاین و محلی', 'سازگار با گوشی‌های اندروید و iOS', 'پشتیبانی فنی پس از تحویل'],
    featuresEn: ['Modern intuitive UI', 'Local & offline data storage', 'Android & iOS cross-platform', 'Post-delivery technical support'],
    startingPrice: 'از ۸ میلیون تومان',
    deliveryTime: '۲ تا ۴ هفته کاری',
    icon: 'Smartphone',
  },
  {
    id: 'other',
    titleFa: 'هوش مصنوعی و طراحی خلاق',
    titleEn: 'AI & Custom Creative Solutions',
    descFa: 'تولید ویدیوهای خلاق با تکنیک‌های پیشرفته هوش مصنوعی، برندینگ دیجیتال، بنرهای متحرک و اتوماسیون.',
    descEn: 'Next-gen video generation with AI techniques, motion design, digital branding, and custom automation.',
    badge: 'Next-Gen',
    featuresFa: ['تولید ویدیو و تیزر مبتنی بر هوش مصنوعی', 'طراحی هویت بصری و لوگوموشن', 'مشاوره اختصاصی توسعه دیجیتال', 'یکپارچه‌سازی با ربات‌های تلگرام'],
    featuresEn: ['AI-powered video creation', 'Visual identity & logomotion', 'Digital strategy consultation', 'Telegram bot automation'],
    startingPrice: 'توافقی',
    deliveryTime: '۲ تا ۵ روز کاری',
    icon: 'Sparkles',
  },
];

export interface PortfolioItem {
  id: string;
  category: ProjectType;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  tags: string[];
  image: string;
}

export const PORTFOLIO_ITEMS: any[] = [
  {
    id: 'pr-1',
    category: 'video',
    type: 'video',
    titleFa: 'تیزر تبلیغاتی محصول',
    titleEn: 'Product Commercial Teaser',
    descFa: 'تدوین و مونتاژ تیزر با ادوبی پریمیر پرو، شامل اصلاح رنگ سینمایی، افکت‌های صوتی و ضرب‌آهنگ متناسب با موسیقی.',
    descEn: 'Commercial video editing in Adobe Premiere Pro with cinematic Lumetri color and dynamic sound design.',
    tags: ['Adobe Premiere Pro', 'Color Grading', 'Sound Design'],
    image: videoImage,
    mediaUrl: `${import.meta.env.BASE_URL}assets/nem/pr1.mp4`,
    posterUrl: `${import.meta.env.BASE_URL}assets/nem/pr1c.png`,
  },
  {
    id: 'pr-2',
    category: 'web',
    type: 'image',
    titleFa: 'سایت شرکتی مدرن',
    titleEn: 'Modern Corporate Website',
    descFa: 'طراحی و کدنویسی وب‌سایت شرکتی مدرن با انیمیشن‌های روان، سرعت لود بالا و بهینه‌سازی کامل سئو.',
    descEn: 'Design and engineering of a corporate web platform with smooth animations and responsive UX.',
    tags: ['HTML/CSS', 'JavaScript', 'Responsive', 'SEO'],
    image: webImage,
    mediaUrl: `${import.meta.env.BASE_URL}assets/nem/N1html.png`,
  },
  {
    id: 'pr-3',
    category: 'mobile',
    type: 'image',
    titleFa: 'اپلیکیشن مدیریت وظایف',
    titleEn: 'Task Management App',
    descFa: 'اپلیکیشن موبایل ساده و کاربردی برای مدیریت وظایف روزانه با قابلیت ثبت، پیگیری و دسته‌بندی کارها.',
    descEn: 'Clean mobile application for daily task management and productivity tracking.',
    tags: ['Basic Mobile', 'Cross-Platform', 'Clean Architecture'],
    image: mobileImage,
    mediaUrl: `${import.meta.env.BASE_URL}assets/nem/app1.png`,
  },
  {
    id: 'pr-4',
    category: 'video',
    type: 'video',
    titleFa: 'تیزر تبلیغاتی',
    titleEn: 'Promotional Teaser',
    descFa: 'تدوین تیزر تبلیغاتی با ریتم‌سازی دقیق، افکت‌های بصری جذاب و کات‌های حرفه‌ای در پریمیر پرو.',
    descEn: 'Promotional teaser crafted with high rhythm, VFX transitions, and Premiere Pro precision.',
    tags: ['Premiere Pro', 'VFX', 'Speed Ramp', 'Commercial'],
    image: videoImage,
    mediaUrl: `${import.meta.env.BASE_URL}assets/nem/pr2.mp4`,
    posterUrl: `${import.meta.env.BASE_URL}assets/nem/pr2c.png`,
  },
  {
    id: 'pr-5',
    category: 'web',
    type: 'image',
    titleFa: 'وب‌سایت رزومه',
    titleEn: 'Resume & Portfolio Website',
    descFa: 'طراحی و پیاده‌سازی وب‌سایت شخصی و رزومه توسعه‌دهنده با تمرکز بر سادگی و سرعت بارگذاری.',
    descEn: 'Personal showcase site with high performance and refined visual typography.',
    tags: ['HTML/CSS', 'Responsive', 'Personal Brand'],
    image: webImage,
    mediaUrl: `${import.meta.env.BASE_URL}assets/nem/N2html.png`,
  },
  {
    id: 'pr-6',
    category: 'mobile',
    type: 'image',
    titleFa: 'اپلیکیشن یادداشت‌برداری',
    titleEn: 'Note-Taking App',
    descFa: 'اپلیکیشن موبایل سبک برای یادداشت‌برداری سریع با ذخیره‌سازی محلی و طراحی مینیمال.',
    descEn: 'Lightweight offline-first note taking mobile application.',
    tags: ['Basic Mobile', 'Offline', 'Local Sync'],
    image: mobileImage,
    mediaUrl: `${import.meta.env.BASE_URL}assets/nem/app2.png`,
  },
  {
    id: 'pr-7',
    category: 'video',
    type: 'video',
    titleFa: 'ساخت ویدیو با AI',
    titleEn: 'AI Generative Video Creation',
    descFa: 'ساخت ویدیوهای خلاقانه با استفاده از هوش مصنوعی، پرامپت‌نویسی پیشرفته و تکنیک‌های نسل جدید تدوین.',
    descEn: 'Next-generation creative video generation powered by AI models and hybrid post-production.',
    tags: ['AI Video', 'Generative', 'Next-Gen Media'],
    image: heroImage,
    mediaUrl: `${import.meta.env.BASE_URL}assets/nem/ai1.mp4`,
    posterUrl: `${import.meta.env.BASE_URL}assets/nem/ai1c.png`,
  },
];

export const FAQ_ITEMS = [
  {
    qFa: 'هزینه پروژه‌ها چگونه محاسبه می‌شود؟',
    qEn: 'How are project costs calculated?',
    aFa: 'هزینه‌ها بر اساس میزان پیچیدگی، زمان تحویل و حجم کاری پروژه تعیین می‌شود. پس از ثبت سفارش در فرم سایت، برآورد دقیق و پیش‌فاکتور شفاف به شما ارائه خواهد شد.',
    aEn: 'Costs are determined based on complexity, delivery deadline, and workload. After submitting your request, a transparent detailed estimate is sent to you.',
  },
  {
    qFa: 'انجام هر پروژه چقدر زمان می‌برد؟',
    qEn: 'How long does a project take?',
    aFa: 'تدوین ویدیو معمولاً بین ۳ تا ۷ روز کاری، طراحی وب‌سایت ۱ تا ۲ هفته، و اپلیکیشن موبایل ۲ تا ۴ هفته به طول می‌انجامد. امکان سفارش تحویل فوری نیز وجود دارد.',
    aEn: 'Video editing takes 3-7 business days, websites 1-2 weeks, and mobile apps 2-4 weeks. Expedited delivery is also available upon request.',
  },
  {
    qFa: 'آیا پس از تحویل پروژه امکان ویرایش و اصلاح وجود دارد؟',
    qEn: 'Are revisions included after delivery?',
    aFa: 'بله، هر سفارش شامل ۲ مرحله بازبینی و ادیت رایگان است تا اطمینان حاصل شود نتیجه نهایی دقیقاً با خواسته و انتظار شما مطابقت دارد.',
    aEn: 'Yes, each project includes two complimentary revision rounds to ensure the final output completely matches your standards.',
  },
  {
    qFa: 'آیا برای پروژه‌های بزرگ قرارداد رسمی منعقد می‌شود؟',
    qEn: 'Is a formal contract provided for larger projects?',
    aFa: 'بله، برای پروژه‌ها قرارداد رسمی دوطرفه به همراه فازبندی پرداخت، زمان‌بندی دقیق و بندهای محرمانگی (NDA) امضا می‌گردد.',
    aEn: 'Yes, for projects a formal contract with structured milestones, payment schedules, and NDA protection is signed.',
  },
];

export const SOCIAL_LINKS = {
  telegramChannel: 'https://t.me/RITM_FreeLancer',
  youtube: 'https://www.youtube.com/RITM_Editz',
  x: 'https://x.com/RITM_Editz',
  ble: 'https://ble.ir/RITM_FreeLancer',
};
