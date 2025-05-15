import { ChevronRight } from "lucide-react";
import { Tab } from "@/app/(frontend)/profile/page";

interface ProfileTabButtonProps {
  tab: Tab;
  activeTab: Tab;
  icon: React.ReactNode;
  label: string;
  onClick: (tab: Tab) => void;
}

export default function ProfileTabButton({ tab, activeTab, icon, label, onClick }: ProfileTabButtonProps) {
  return (
    <button
      onClick={() => onClick(tab)}
      className={`w-full flex items-center justify-between p-3 rounded-lg text-left ${
        activeTab === tab ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}