import type { DeploymentExposure, DeploymentMode } from "@paperclipai/shared";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n";

export function ModeBadge({
  deploymentMode,
  deploymentExposure,
}: {
  deploymentMode?: DeploymentMode;
  deploymentExposure?: DeploymentExposure;
}) {
  const { t } = useTranslation();
  if (!deploymentMode) return null;

  const label =
    deploymentMode === "local_trusted"
      ? t("settings.instanceGeneral.deployment.mode.localTrusted")
      : deploymentExposure === "public"
        ? t("settings.instanceGeneral.deployment.mode.authenticatedPublic")
        : t("settings.instanceGeneral.deployment.mode.authenticatedPrivate");

  return <Badge variant="outline">{label}</Badge>;
}
