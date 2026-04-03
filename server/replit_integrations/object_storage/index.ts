export {
  ObjectStorageService,
  ObjectNotFoundError,
  objectStorageClient,
} from "./objectStorage";

export type {
  ObjectAclPolicy,
  ObjectAccessGroup,
  ObjectAccessGroupType,
  ObjectAclRule,
} from "./objectAcl";

export {
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

export { registerObjectStorageRoutes } from "./routes";



import path from "path";

app.use(express.static(path.join(process.cwd(), "dist/public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist/public/index.html"));
});
