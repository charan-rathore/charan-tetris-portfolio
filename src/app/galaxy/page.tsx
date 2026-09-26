import type { Metadata } from "next";
import { GalaxyAtlas } from "@/components/galaxy/GalaxyAtlas";
import { galaxyNodes } from "@/data/galaxy";

export const metadata: Metadata = {
  title: "The work galaxy · Charan Rathore",
  description: "Follow projects, open-source work and ideas back to their source.",
};
export default async function GalaxyPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { focus } = await searchParams;
  const selected = focus && galaxyNodes.some(node => node.id === focus) ? focus : "systris";
  return <GalaxyAtlas initialFocus={selected} />;
}
