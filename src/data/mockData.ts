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

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'pr-1',
    category: 'video',
    titleFa: 'تدوین تیزر تبلیغاتی با ادوبی پریمیر پرو (Commercial Promo Cut)',
    titleEn: 'Commercial Promo Edit with Adobe Premiere Pro',
    descFa: 'تدوین ریتمیک، ضرب‌آهنگ اختصاصی با موسیقی، اصلاح رنگ Lumetri Color، افکت‌های صوتی SFX و خروجی باکیفیت 4K در نرم‌افزار Premiere Pro.',
    descEn: 'Fast rhythmic pacing, Lumetri color correction, sound design & dynamic 4K export in Premiere Pro.',
    tags: ['Adobe Premiere Pro', 'Lumetri Color', 'Sound Design', 'Beat Sync'],
    image: videoImage,
  },
  {
    id: 'pr-2',
    category: 'video',
    titleFa: 'تدوین مستند و ولاگ یوتیوب در پریمیر (YouTube Documentary Edit)',
    titleEn: 'YouTube Storytelling & Documentary in Premiere',
    descFa: 'روایت‌گری بصری، تدوین چنددوربینه (Multi-Camera)، ترنزیشن‌های سینمایی J-Cut و L-Cut، و زیرنویس متحرک جذاب با پریمیر پرو.',
    descEn: 'Multi-cam editing, J-cuts & L-cuts, auto captions and pacing optimized for high YouTube retention.',
    tags: ['Premiere Pro CC', 'Multi-Cam Editing', 'J & L Cuts', 'Auto Captions'],
    image: videoImage,
  },
  {
    id: 'pr-3',
    category: 'video',
    titleFa: 'ریلز و شورتز وایرال اینستاگرام با پریمیر (High-Retention Reels)',
    titleEn: 'High-Retention Instagram Reels in Premiere',
    descFa: 'قلاب بصری ۳ ثانیه اول (Visual Hook)، ترنزیشن‌های زوم و چرخش، ایموجی‌های متحرک و تنظیم کادربندی عمودی ۹:۱۶ در پریمیر پرو.',
    descEn: '3-second hook editing, dynamic zoom transitions, kinetic typography and 9:16 vertical pacing in Premiere.',
    tags: ['Premiere Pro', 'Vertical 9:16', 'Kinetic Typography', 'Retention Hook'],
    image: videoImage,
  },
  {
    id: 'pr-4',
    category: 'video',
    titleFa: 'موزیک ویدیو سینمایی و کالرگرید در پریمیر (Cinematic Music Video)',
    titleEn: 'Cinematic Music Video Post in Premiere',
    descFa: 'هماهنگی کات‌ها با اوج آهنگ، مسکینگ ترنزیشن، تغییر سرعت فریم‌ها (Speed Ramp) و تصحیح نور و کنتراست سینمایی در پریمیر.',
    descEn: 'Beat matching, masking transitions, speed ramping and cinematic grade crafted in Premiere Pro.',
    tags: ['Premiere Pro', 'Speed Ramp', 'Masking Transitions', 'Color Grading'],
    image: videoImage,
  },
  {
    id: 'p1',
    category: 'video',
    titleFa: 'تیزر معرفی محصول لوکس با پریمیر',
    titleEn: 'Product Introduction Teaser with Premiere',
    descFa: 'تدوین و سرهم‌بندی تیزر با پریمیر پرو، اصلاح رنگ سینمایی و طراحی صداگذاری ریتمیک.',
    descEn: 'Editing and assembly of teaser using Premiere Pro with cinematic color grading.',
    tags: ['Adobe Premiere Pro', 'Color Grading', 'Sound Design'],
    image: videoImage,
  },
  {
    id: 'p2',
    category: 'web',
    titleFa: 'سایت شرکتی مدرن و تعاملی',
    titleEn: 'Modern Corporate Website',
    descFa: 'طراحی و کدنویسی سایت شرکتی با انیمیشن‌های مینیمال، سرعت فوق‌العاده و بهینه‌سازی موتورهای جستجو.',
    descEn: 'Design and coding of corporate website with smooth micro-interactions and SEO.',
    tags: ['Next.js / Vite', 'Tailwind CSS', 'SEO Pro'],
    image: webImage,
  },
  {
    id: 'p3',
    category: 'mobile',
    titleFa: 'اپلیکیشن مدیریت وظایف روزانه',
    titleEn: 'Task Management Mobile App',
    descFa: 'اپلیکیشن سبک و کاربردی برای مدیریت کارهای روزمره با سیستم اعلان و ذخیره‌سازی محلی.',
    descEn: 'A clean mobile application for daily task management with offline-first logging.',
    tags: ['React Native', 'Offline DB', 'Clean Architecture'],
    image: mobileImage,
  },
  {
    id: 'p4',
    category: 'video',
    titleFa: 'تیزر تبلیغاتی استارتاپی در پریمیر',
    titleEn: 'Promotional Launch Teaser in Premiere',
    descFa: 'تدوین تبلیغاتی با ریتم تند و جلوه‌های بصری خیره‌کننده با ادوبی پریمیر پرو جهت معرفی محصول در شبکه‌های اجتماعی.',
    descEn: 'Fast-paced promotional editing with visual effects in Adobe Premiere designed for social conversions.',
    tags: ['Premiere Pro', 'Visual Effects', 'Motion Graphics', 'Fast Cut'],
    image: videoImage,
  },
  {
    id: 'p5',
    category: 'web',
    titleFa: 'وب‌سایت شخصی و رزومه توسعه‌دهنده',
    titleEn: 'Developer Resume & Portfolio Website',
    descFa: 'پیاده‌سازی سایت شخصی با تمرکز بر سادگی، سرعت لود بالا و تجربه کاربری دارک مود.',
    descEn: 'Personal showcase site with high lighthouse score and refined typography.',
    tags: ['React', 'Dark Theme', 'High Performance'],
    image: webImage,
  },
  {
    id: 'p6',
    category: 'other',
    titleFa: 'ویدیوسازی خلاقانه با هوش مصنوعی',
    titleEn: 'Generative AI Creative Video',
    descFa: 'تولید ویدیوهای سوررئال و تیزرهای برندینگ با مدل‌های پیشرفته هوش مصنوعی و جلوه‌های صوتی ترکیبی.',
    descEn: 'Creating surreal and branding videos using generative AI and hybrid audio effects.',
    tags: ['Generative AI', 'Cinematic Prompting', 'Hybrid Post'],
    image: heroImage,
  },
];

export const FAQ_ITEMS = [
  {
    qFa: 'هزینه پروژه‌ها چگونه محاسبه می‌شود؟',
    qEn: 'How are project costs calculated?',
    aFa: 'هزینه‌ها بر اساس میزان پیچیدگی، زمان تحویل و حجم کاری پروژه تعیین می‌شود. پس از ثبت سفارش در ربات یا فرم بالا، برآورد دقیق و پیش‌فاکتور شفاف به شما ارائه خواهد شد.',
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
    aFa: 'بله، برای پروژه‌های متوسط و بزرگ قرارداد رسمی دوطرفه به همراه فازبندی پرداخت، زمان‌بندی دقیق و بندهای محرمانگی (NDA) امضا می‌گردد.',
    aEn: 'Yes, for medium and larger projects a formal contract with structured milestones, payment schedules, and NDA protection is signed.',
  },
];

export const SOCIAL_LINKS = {
  telegramBot: 'https://t.me/RITM_FreeLancbot',
  telegramChannel: 'https://t.me/RITM_FreeLancer',
  youtube: 'https://www.youtube.com/RITM_Editz',
  x: 'https://x.com/RITM_Editz',
  ble: 'https://ble.ir/RITM_FreeLancer',
};
