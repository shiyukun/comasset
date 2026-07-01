const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const configPath = process.argv[2] || path.join(root, "config", "app_config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const members = config.familyMembers || [];
const accessControl = config.accessControl || {};
const roles = accessControl.roles || {};
const permissions = accessControl.permissions || {};
const errors = [];

function fail(message) {
  errors.push(message);
}

if (!members.length) fail("familyMembers must include at least one member");
if (!Object.keys(roles).length) fail("accessControl.roles must be defined");
if (!Object.keys(permissions).length) fail("accessControl.permissions must be defined");

const memberIds = new Set();
members.forEach((member) => {
  if (!member.id) fail("family member missing id");
  if (memberIds.has(member.id)) fail(`duplicate family member id: ${member.id}`);
  memberIds.add(member.id);
  if (!member.name) fail(`family member ${member.id || "(unknown)"} missing name`);
  if (!member.role || !roles[member.role]) fail(`family member ${member.id || "(unknown)"} has unknown role: ${member.role}`);
  const memberPermissions = member.permissions || roles[member.role]?.permissions || [];
  const rolePermissions = roles[member.role]?.permissions || [];
  if (member.permissions && JSON.stringify(memberPermissions) !== JSON.stringify(rolePermissions)) {
    fail(`family member ${member.id || "(unknown)"} permissions differ from role ${member.role}`);
  }
  if (!memberPermissions.includes("view")) fail(`family member ${member.id || "(unknown)"} must include view permission`);
  memberPermissions.forEach((permission) => {
    if (!permissions[permission]) fail(`family member ${member.id || "(unknown)"} references unknown permission: ${permission}`);
  });
});

Object.entries(roles).forEach(([role, definition]) => {
  if (!definition.labelZh || !definition.labelEn) fail(`role ${role} must include bilingual labels`);
  if (!definition.descriptionZh || !definition.descriptionEn) fail(`role ${role} must include bilingual descriptions`);
  if (!Array.isArray(definition.permissions) || !definition.permissions.includes("view")) {
    fail(`role ${role} must include view permission`);
  }
  (definition.permissions || []).forEach((permission) => {
    if (!permissions[permission]) fail(`role ${role} references unknown permission: ${permission}`);
  });
});

Object.entries(permissions).forEach(([permission, definition]) => {
  if (!definition.labelZh || !definition.labelEn) fail(`permission ${permission} must include bilingual labels`);
});

if (errors.length) {
  errors.forEach((error) => console.error(`FAIL ${error}`));
  process.exit(1);
}

console.log(`Family access config is valid (${members.length} members, ${Object.keys(roles).length} roles).`);
