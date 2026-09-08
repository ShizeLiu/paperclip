import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BadgeDollarSign,
  BookOpenText,
  History,
  KeyRound,
  Library,
  PlayCircle,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { agentsApi } from "@/api/agents";
import { useCompany } from "@/context/CompanyContext";
import { useTranslation } from "@/i18n";
import { queryKeys } from "@/lib/queryKeys";
import { ContextualSidebarFrame } from "./ContextualSidebarFrame";
import { SidebarNavItem } from "./SidebarNavItem";
import { contextualSidebarStyles } from "./contextual-sidebar-styles";
import {
  AGENT_DETAIL_NAVIGATION,
  agentDetailHref,
  agentScopedAuditHref,
  type AgentLocalDetailView,
} from "@/pages/agent-detail-navigation";

const localIcons = {
  overview: Sparkles,
  instructions: BookOpenText,
  skills: Library,
  runtime: Settings2,
  secrets: ShieldCheck,
  tools: Wrench,
  permissions: ShieldCheck,
  "api-keys": KeyRound,
  revisions: History,
} satisfies Record<AgentLocalDetailView, typeof Sparkles>;

const auditItems = [
  { section: "activity", labelKey: "pages.agentDetail.sidebar.activity", icon: Activity },
  { section: "runs", labelKey: "pages.agentDetail.sidebar.runs", icon: PlayCircle },
  { section: "costs", labelKey: "pages.agentDetail.sidebar.costs", icon: ReceiptText },
  { section: "budgets", labelKey: "pages.agentDetail.sidebar.budgets", icon: BadgeDollarSign },
] as const;

const localLabelKeys: Record<AgentLocalDetailView, string> = {
  overview: "pages.agentDetail.sidebar.overview",
  instructions: "pages.agentDetail.sidebar.instructions",
  skills: "pages.agentDetail.sidebar.skills",
  runtime: "pages.agentDetail.sidebar.harnessRuntime",
  secrets: "pages.agentDetail.sidebar.secrets",
  tools: "pages.agentDetail.sidebar.tools",
  permissions: "pages.agentDetail.sidebar.permissionsTrust",
  "api-keys": "pages.agentDetail.sidebar.apiKeys",
  revisions: "pages.agentDetail.sidebar.revisions",
};

const sectionLabelKeys: Record<string, string> = {
  Agent: "pages.agentDetail.sidebar.agent",
  Runtime: "pages.agentDetail.sidebar.runtime",
  Governance: "pages.agentDetail.sidebar.governance",
};

export function AgentContextualSidebar({
  agentRef,
  agentId,
  agentName,
}: {
  agentRef: string;
  agentId?: string;
  agentName?: string;
}) {
  const { t } = useTranslation();
  const { selectedCompanyId } = useCompany();
  const shouldResolveAgent = !agentId || !agentName;
  const { data: resolvedAgent } = useQuery({
    queryKey: [...queryKeys.agents.detail(agentRef), selectedCompanyId ?? null, "contextual-sidebar"],
    queryFn: () => agentsApi.get(agentRef, selectedCompanyId ?? undefined),
    enabled: shouldResolveAgent && Boolean(agentRef && selectedCompanyId),
  });
  const resolvedId = agentId ?? resolvedAgent?.id;
  const resolvedName = agentName ?? resolvedAgent?.name ?? "Agent";

  return (
    <ContextualSidebarFrame
      surface="agent"
      title={resolvedName}
      fallbackTo="/agents/all"
      showHeader={false}
      className="border-r border-border bg-background"
    >
      <nav
        aria-label={`${resolvedName} navigation`}
        data-slot="contextual-sidebar-nav"
        className={contextualSidebarStyles.nav}
      >
        {AGENT_DETAIL_NAVIGATION.map((section) => (
          <div
            key={section.label}
            data-slot="contextual-sidebar-section"
            className={contextualSidebarStyles.section}
          >
            <p
              data-slot="contextual-sidebar-section-label"
              className={contextualSidebarStyles.sectionLabel}
            >
              {t(sectionLabelKeys[section.label] ?? section.label)}
            </p>
            <div data-slot="contextual-sidebar-group" className={contextualSidebarStyles.group}>
              {section.items.map((item) => {
                const href = agentDetailHref(agentRef, item.value);
                return (
                  <SidebarNavItem
                    key={item.value}
                    to={href}
                    label={t(localLabelKeys[item.value], { defaultValue: item.label })}
                    icon={localIcons[item.value]}
                  />
                );
              })}
            </div>
          </div>
        ))}

        <div data-slot="contextual-sidebar-section" className={contextualSidebarStyles.section}>
          <p
            data-slot="contextual-sidebar-section-label"
            className={contextualSidebarStyles.sectionLabel}
          >
            {t("pages.agentDetail.sidebar.audit")}
          </p>
          <div data-slot="contextual-sidebar-group" className={contextualSidebarStyles.group}>
            {resolvedId ? auditItems.map((item) => (
              <SidebarNavItem
                key={item.section}
                to={agentScopedAuditHref(resolvedId, item.section)}
                label={t(item.labelKey)}
                icon={item.icon}
              />
            )) : (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">
                {t("pages.agentDetail.sidebar.loadingAuditLinks")}
              </p>
            )}
          </div>
        </div>
      </nav>
    </ContextualSidebarFrame>
  );
}
