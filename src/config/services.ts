export interface ServicePreset {
  id: string
  label: { en: string; bn: string }
  items: { en: string; bn: string }[]
}

export const SERVICE_PRESETS: ServicePreset[] = [
  {
    id: 'logo',
    label: { en: 'Logo Design', bn: 'লোগো ডিজাইন' },
    items: [
      { en: 'Concept development', bn: 'কনসেপ্ট ডেভেলপমেন্ট' },
      { en: '3 revision rounds', bn: '৩ রাউন্ড রিভিশন' },
      { en: 'Final PNG / JPG', bn: 'ফাইনাল PNG / JPG' },
      { en: 'Source file', bn: 'সোর্স ফাইল' },
    ],
  },
  {
    id: 'brand',
    label: { en: 'Brand Identity', bn: 'ব্র্যান্ড আইডেন্টিটি' },
    items: [
      { en: 'Logo suite', bn: 'লোগো স্যুট' },
      { en: 'Color palette', bn: 'কালার প্যালেট' },
      { en: 'Typography', bn: 'টাইপোগ্রাফি' },
      { en: 'Brand guideline PDF', bn: 'ব্র্যান্ড গাইডলাইন PDF' },
    ],
  },
  {
    id: 'social',
    label: { en: 'Social Media Pack', bn: 'সোশ্যাল মিডিয়া প্যাক' },
    items: [
      { en: 'Post design', bn: 'পোস্ট ডিজাইন' },
      { en: 'Story design', bn: 'স্টোরি ডিজাইন' },
      { en: 'Caption layout', bn: 'ক্যাপশন লেআউট' },
    ],
  },
  {
    id: 'banner',
    label: { en: 'Banner & Poster', bn: 'ব্যানার ও পোস্টার' },
    items: [
      { en: 'Layout draft', bn: 'লেআউট ড্রাফট' },
      { en: 'Print-ready file', bn: 'প্রিন্ট-রেডি ফাইল' },
      { en: 'Web version', bn: 'ওয়েব ভার্সন' },
    ],
  },
  {
    id: 'card',
    label: { en: 'Business Card & Print', bn: 'বিজনেস কার্ড ও প্রিন্ট' },
    items: [
      { en: 'Front design', bn: 'সামনের ডিজাইন' },
      { en: 'Back design', bn: 'পেছনের ডিজাইন' },
      { en: 'Print-ready PDF', bn: 'প্রিন্ট-রেডি PDF' },
    ],
  },
  {
    id: 'thumbnail',
    label: { en: 'YouTube Thumbnail', bn: 'ইউটিউব থাম্বনেইল' },
    items: [
      { en: 'Concept + text', bn: 'কনসেপ্ট + টেক্সট' },
      { en: 'Final 1280x720', bn: 'ফাইনাল ১২৮০x৭২০' },
    ],
  },
  {
    id: 'web',
    label: { en: 'UI / Web Design', bn: 'ইউআই / ওয়েব ডিজাইন' },
    items: [
      { en: 'Wireframe', bn: 'ওয়্যারফ্রেম' },
      { en: 'High-fidelity mockup', bn: 'হাই-ফিডেলিটি মকআপ' },
      { en: 'Developer handoff', bn: 'ডেভেলপার হ্যান্ডঅফ' },
    ],
  },
  {
    id: 'custom',
    label: { en: 'General Service', bn: 'সাধারণ সার্ভিস' },
    items: [
      { en: 'Requirement gathering', bn: 'প্রয়োজনীয়তা সংগ্রহ' },
      { en: 'Draft delivery', bn: 'ড্রাফট ডেলিভারি' },
      { en: 'Final delivery', bn: 'ফাইনাল ডেলিভারি' },
    ],
  },
]

export const PROJECT_CATEGORIES = [
  'Logo Design',
  'Brand Identity',
  'Social Media Post',
  'Banner & Poster',
  'Business Card & Print',
  'YouTube Thumbnail',
  'UI / Web Design',
  'Packaging Design',
  'Other',
]
