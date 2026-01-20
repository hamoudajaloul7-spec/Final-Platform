import React, { useState } from 'react';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface Props {
  onFinish: (data: any) => void;
}

// Wizard scaffold for 8-step automated store creation
const StoreCreationWizard: React.FC<Props> = ({ onFinish }) => {
  const [step, setStep] = useState<Step>(1);
  const [storeData, setStoreData] = useState<any>({});

  const next = () => {
    if (step === 8) {
      onFinish(storeData);
      return;
    }
    setStep((s) => ((s as number) + 1) as Step);
  };

  // Simple placeholder UI; actual inputs should align with contracted Store data
  return (
    <div className="store-creation-wizard">
      <div className="header">إنشاء متجر جديد - الخطوة {step} من 8</div>
      <div className="body">
        <p>هذه المنطقة مخصصة لنماذج الإدخال وفق contract البيانات المعتمد. سيتم ملء البيانات تلقائياً من API/رفع المستخدم لاحقاً.</p>
      </div>
      <div className="footer">
        <button onClick={next} className="btn btn-primary">التالي</button>
      </div>
    </div>
  );
};

export default StoreCreationWizard;
