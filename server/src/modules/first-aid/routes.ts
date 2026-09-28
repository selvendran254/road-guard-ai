import { Router } from 'express';

const router = Router();

const guides: Record<string, { title: string; steps: string[] }[]> = {
  en: [
    { title: 'Bleeding', steps: ['Apply direct pressure with clean cloth', 'Elevate the injured area', 'Do not remove embedded objects', 'Call emergency services if severe'] },
    { title: 'Unconscious person', steps: ['Check responsiveness', 'Open airway — head tilt, chin lift', 'Check breathing', 'Start CPR if not breathing (30 compressions, 2 breaths)'] },
    { title: 'Burns', steps: ['Cool with running water 20 minutes', 'Remove tight clothing/jewelry', 'Cover with clean non-fluffy cloth', 'Do not apply ice or butter'] },
    { title: 'Choking', steps: ['Encourage coughing if partial blockage', '5 back blows between shoulder blades', '5 abdominal thrusts (Heimlich)', 'Call emergency if not resolved'] },
  ],
  ta: [
    { title: 'Blood loss / Bleeding', steps: ['Clean cloth-ala direct pressure', 'Injured area-a elevate pannunga', 'Emergency call pannunga'] },
    { title: 'Unconscious', steps: ['Response check pannunga', 'Airway open pannunga', 'Breathing check', 'CPR if needed'] },
  ],
  hi: [
    { title: 'Bleeding', steps: ['सीधा दबाव लगाएँ', 'घाव को ऊपर उठाएँ', 'आपातकालीन सेवा को कॉल करें'] },
    { title: 'Unconscious', steps: ['प्रतिक्रिया जाँचें', 'साँस की जाँच', 'CPR यदि आवश्यक'] },
  ],
};

router.get('/guides', (req, res) => {
  const lang = (req.query.lang as string) || 'en';
  res.json({ guides: guides[lang] || guides.en, lang });
});

export default router;
