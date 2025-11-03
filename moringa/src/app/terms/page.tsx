'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function TermsPage() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'Terms & Conditions',
      lastUpdated: 'Last updated: November 2, 2025',
      sections: [
        {
          title: '1. Acceptance of Terms',
          content: 'By accessing and using Moringa\'s food ordering platform, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.'
        },
        {
          title: '2. Use of Service',
          content: 'Our service allows you to order food for delivery, takeaway, or dine-in. You must be at least 18 years old to place orders. You agree to provide accurate and complete information when placing orders and to update this information as necessary.'
        },
        {
          title: '3. Orders and Payment',
          content: 'All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Prices are subject to change without notice. Payment must be made in full at the time of ordering through our accepted payment methods.'
        },
        {
          title: '4. Delivery',
          content: 'Delivery times are estimates and not guaranteed. We will make reasonable efforts to deliver within the estimated time. Delivery fees may apply and will be shown before you complete your order. You must be available to receive delivery at the address provided.'
        },
        {
          title: '5. Cancellations and Refunds',
          content: 'Orders may be cancelled within 5 minutes of placement for a full refund. After this period, cancellations are subject to our discretion. See our Refund Policy for more details on refund eligibility and procedures.'
        },
        {
          title: '6. Food Safety and Allergies',
          content: 'While we take reasonable precautions, we cannot guarantee that our food is free from allergens. It is your responsibility to inform us of any allergies or dietary restrictions. We are not liable for any allergic reactions or food-related illnesses.'
        },
        {
          title: '7. Intellectual Property',
          content: 'All content on our platform, including text, graphics, logos, and images, is the property of Moringa and protected by copyright laws. You may not reproduce, distribute, or create derivative works without our express written permission.'
        },
        {
          title: '8. Limitation of Liability',
          content: 'To the maximum extent permitted by law, Moringa shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our service.'
        },
        {
          title: '9. Changes to Terms',
          content: 'We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting. Your continued use of the service after changes constitutes acceptance of the modified terms.'
        },
        {
          title: '10. Contact',
          content: 'For questions about these Terms and Conditions, please contact us at info@moringa.com or call +972 52-589-9214.'
        }
      ]
    },
    ar: {
      title: 'الشروط والأحكام',
      lastUpdated: 'آخر تحديث: 2 نوفمبر 2025',
      sections: [
        {
          title: '1. قبول الشروط',
          content: 'من خلال الوصول إلى منصة طلب الطعام في مورينجا واستخدامها، فإنك تقبل وتوافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام خدماتنا.'
        },
        {
          title: '2. استخدام الخدمة',
          content: 'تسمح لك خدمتنا بطلب الطعام للتوصيل أو الاستلام أو تناول الطعام في المكان. يجب أن يكون عمرك 18 عامًا على الأقل لتقديم الطلبات. توافق على تقديم معلومات دقيقة وكاملة عند تقديم الطلبات وتحديث هذه المعلومات حسب الضرورة.'
        },
        {
          title: '3. الطلبات والدفع',
          content: 'جميع الطلبات تخضع للقبول والتوافر. نحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب. الأسعار عرضة للتغيير دون إشعار. يجب الدفع بالكامل وقت الطلب من خلال طرق الدفع المقبولة لدينا.'
        },
        {
          title: '4. التوصيل',
          content: 'أوقات التوصيل تقديرية وليست مضمونة. سنبذل جهودًا معقولة للتوصيل ضمن الوقت المقدر. قد يتم تطبيق رسوم التوصيل وستظهر قبل إكمال طلبك. يجب أن تكون متاحًا لاستلام التوصيل في العنوان المقدم.'
        },
        {
          title: '5. الإلغاءات والمبالغ المستردة',
          content: 'يمكن إلغاء الطلبات في غضون 5 دقائق من الطلب لاسترداد كامل المبلغ. بعد هذه الفترة، تخضع الإلغاءات لتقديرنا. راجع سياسة الاسترجاع لمزيد من التفاصيل حول أهلية الاسترجاع والإجراءات.'
        },
        {
          title: '6. سلامة الغذاء والحساسية',
          content: 'بينما نتخذ احتياطات معقولة، لا يمكننا ضمان خلو طعامنا من مسببات الحساسية. تقع على عاتقك مسؤولية إبلاغنا بأي حساسية أو قيود غذائية. نحن غير مسؤولين عن أي ردود فعل تحسسية أو أمراض متعلقة بالطعام.'
        },
        {
          title: '7. الملكية الفكرية',
          content: 'جميع المحتويات على منصتنا، بما في ذلك النصوص والرسومات والشعارات والصور، هي ملك لمورينجا ومحمية بموجب قوانين حقوق النشر. لا يجوز لك إعادة إنتاج أو توزيع أو إنشاء أعمال مشتقة دون إذن كتابي صريح منا.'
        },
        {
          title: '8. حدود المسؤولية',
          content: 'إلى أقصى حد يسمح به القانون، لا تتحمل مورينجا المسؤولية عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية ناتجة عن استخدامك لخدمتنا.'
        },
        {
          title: '9. التغييرات على الشروط',
          content: 'نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. ستكون التغييرات سارية فور النشر. استمرارك في استخدام الخدمة بعد التغييرات يشكل قبولًا للشروط المعدلة.'
        },
        {
          title: '10. الاتصال',
          content: 'للأسئلة حول هذه الشروط والأحكام، يرجى الاتصال بنا على info@moringa.com أو الاتصال على +972 52-589-9214.'
        }
      ]
    },
    he: {
      title: 'תנאים והגבלות',
      lastUpdated: 'עודכן לאחרונה: 2 בנובמבר 2025',
      sections: [
        {
          title: '1. קבלת התנאים',
          content: 'על ידי גישה ושימוש בפלטפורמת הזמנת האוכל של מורינגה, אתה מקבל ומסכים להיות קשור בתנאים והגבלות אלה. אם אינך מסכים לתנאים אלה, אנא אל תשתמש בשירותים שלנו.'
        },
        {
          title: '2. שימוש בשירות',
          content: 'השירות שלנו מאפשר לך להזמין אוכל למשלוח, איסוף או אכילה במקום. עליך להיות בן 18 לפחות כדי לבצע הזמנות. אתה מסכים לספק מידע מדויק ומלא בעת ביצוע הזמנות ולעדכן מידע זה לפי הצורך.'
        },
        {
          title: '3. הזמנות ותשלום',
          content: 'כל ההזמנות כפופות לאישור וזמינות. אנו שומרים לעצמנו את הזכות לסרב או לבטל כל הזמנה מכל סיבה שהיא. המחירים עשויים להשתנות ללא הודעה. יש לשלם במלואו בעת ההזמנה באמצעות אמצעי התשלום המקובלים שלנו.'
        },
        {
          title: '4. משלוח',
          content: 'זמני המשלוח הם הערכות ואינם מובטחים. נעשה מאמצים סבירים לספק בתוך הזמן המשוער. עשויים לחול דמי משלוח ויוצגו לפני השלמת ההזמנה. עליך להיות זמין לקבל את המשלוח בכתובת שסופקה.'
        },
        {
          title: '5. ביטולים והחזרים',
          content: 'ניתן לבטל הזמנות תוך 5 דקות מההזמנה להחזר מלא. לאחר תקופה זו, הביטולים כפופים לשיקול דעתנו. עיין במדיניות ההחזרים שלנו לפרטים נוספים על זכאות להחזר והליכים.'
        },
        {
          title: '6. בטיחות מזון ואלרגיות',
          content: 'למרות שאנו נוקטים באמצעי זהירות סבירים, איננו יכולים להבטיח שהאוכל שלנו נקי מאלרגנים. באחריותך להודיע לנו על כל אלרגיות או הגבלות תזונתיות. איננו אחראים לכל תגובות אלרגיות או מחלות הקשורות למזון.'
        },
        {
          title: '7. קניין רוחני',
          content: 'כל התוכן בפלטפורמה שלנו, כולל טקסט, גרפיקה, לוגואים ותמונות, הוא רכושה של מורינגה ומוגן על ידי חוקי זכויות יוצרים. אינך רשאי לשכפל, להפיץ או ליצור יצירות נגזרות ללא אישור בכתב מפורש שלנו.'
        },
        {
          title: '8. הגבלת אחריות',
          content: 'במידה המרבית המותרת על פי חוק, מורינגה לא תהיה אחראית לכל נזקים עקיפים, מקריים, מיוחדים, תוצאתיים או עונשיים הנובעים משימושך בשירות שלנו.'
        },
        {
          title: '9. שינויים בתנאים',
          content: 'אנו שומרים לעצמנו את הזכות לשנות את התנאים וההגבלות הללו בכל עת. השינויים ייכנסו לתוקף מיד עם הפרסום. המשך השימוש שלך בשירות לאחר שינויים מהווה קבלה של התנאים המתוקנים.'
        },
        {
          title: '10. יצירת קשר',
          content: 'לשאלות לגבי תנאים והגבלות אלה, אנא צור איתנו קשר בכתובת info@moringa.com או התקשר ל-052-589-9214+972.'
        }
      ]
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] py-6" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
          {currentContent.title}
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">
          {currentContent.lastUpdated}
        </p>

        <div className="space-y-8">
          {currentContent.sections.map((section, index) => (
            <div key={index} className="bg-[hsl(var(--card))] rounded-lg p-6 border border-[hsl(var(--border))]">
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-3">
                {section.title}
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
