import { useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { IdeaWizard, IdeaFormData } from '@/components/IdeaWizard';

export default function Generate() {
  const [showWizard, setShowWizard] = useState(false);

  const handleCreateProject = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = (data: IdeaFormData) => {
    console.log('Wizard completed:', data);
    setShowWizard(false);
  };

  return (
    <>
      <Dashboard onCreateProject={handleCreateProject} />
      <IdeaWizard 
        open={showWizard} 
        onOpenChange={setShowWizard}
        onComplete={handleWizardComplete}
      />
    </>
  );
}
