import { business as nnatural } from "./nnatural";
import { business as treemail } from "./treemail";

// maps a subdomain string to that business's content object
export const businessContentMap: Record<string, typeof nnatural> = {
  nnatural,
  treemail,
};
