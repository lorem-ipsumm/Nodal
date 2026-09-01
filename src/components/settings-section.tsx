import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export const SettingsSection = ({
  title,
  children,
}: SettingsSectionProps) => (
  <section className="space-y-3">
    <h2 className="text-base font-semibold">{title}</h2>
    {children}
  </section>
);
