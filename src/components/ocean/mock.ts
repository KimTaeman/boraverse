export type OceanResult = "accepted" | "already_contributed" | "read_only";
export type OceanAdapter = { contribute: (key: string) => Promise<OceanResult> };

export function createMockOcean(): OceanAdapter {
  let accepted = false;
  return {
    async contribute() {
      await new Promise((resolve) => setTimeout(resolve, 350));
      if (accepted) return "already_contributed";
      accepted = true;
      return "accepted";
    },
  };
}
