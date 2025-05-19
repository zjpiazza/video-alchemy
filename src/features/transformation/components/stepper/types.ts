export enum TransformationStep {
    SelectVideo = "SelectVideo",
    SelectEffect = "SelectEffect",
    Configure = "Configure",
    Upload = "Upload",
    Progress = "Progress",
    Result = "Result"
  }

export interface StepperLayoutProps {
  title?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backLabel?: string;
  backDisabled?: boolean;
  hideNavigation?: boolean;
}