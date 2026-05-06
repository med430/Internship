"use client";

import { useSecurityTabController } from "../hooks/use-security-tab-controller";
import { SecurityTabProps } from "../lib/security-schemas";
import { EmailSecurityCard } from "./email-security-card";
import { OauthNoticeCard } from "./oauth-notice-card";
import { PasswordSecurityCard } from "./password-security-card";

export function SecurityTabScreen({
  userEmail,
  isOAuthUser,
}: SecurityTabProps) {
  const {
    emailForm,
    passwordForm,
    isUpdatingEmail,
    isUpdatingPassword,
    onEmailSubmit,
    onPasswordSubmit,
  } = useSecurityTabController();

  return (
    <div className="space-y-6">
      {isOAuthUser && <OauthNoticeCard />}

      <EmailSecurityCard
        userEmail={userEmail}
        isOAuthUser={isOAuthUser}
        isUpdatingEmail={isUpdatingEmail}
        emailForm={emailForm}
        onEmailSubmit={onEmailSubmit}
      />

      <PasswordSecurityCard
        isOAuthUser={isOAuthUser}
        isUpdatingPassword={isUpdatingPassword}
        passwordForm={passwordForm}
        onPasswordSubmit={onPasswordSubmit}
      />
    </div>
  );
}
