export const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return "";
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

};
