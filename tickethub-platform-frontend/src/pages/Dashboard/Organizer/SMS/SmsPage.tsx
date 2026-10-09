import { useSearchParams } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SmsCampaign from "./SmsCampaign";
import SmsCredits from "./SmsCredits";
import SmsHistory from "./SmsHistory";

type SmsTab = "send" | "credits" | "history";

const tabs: { value: SmsTab; label: string }[] = [
  { value: "send", label: "Send SMS" },
  { value: "credits", label: "Credits" },
  { value: "history", label: "History" },
];

function getTab(value: string | null): SmsTab {
  return tabs.some((tab) => tab.value === value) ? (value as SmsTab) : "send";
}

export default function SmsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = getTab(searchParams.get("tab"));

  const setTab = (nextTab: string) => {
    setSearchParams(nextTab === "send" ? {} : { tab: nextTab });
  };

  return (
    <div className="min-w-0 ">
      <Tabs value={tab} onValueChange={setTab} className="min-w-0">
        <div className="overflow-x-auto pb-1">
          <TabsList className="min-w-max justify-start sm:w-fit">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="min-w-28 px-3"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="send" className="min-w-0">
          <SmsCampaign embedded />
        </TabsContent>
        <TabsContent value="credits" className="min-w-0">
          <SmsCredits embedded />
        </TabsContent>
        <TabsContent value="history" className="min-w-0">
          <SmsHistory embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
