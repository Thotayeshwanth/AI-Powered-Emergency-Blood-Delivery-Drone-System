/**
 * Role-Based Access Control (RBAC) middleware factory
 * @param  {...string} allowedRoles
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to authorized roles (${allowedRoles.join(', ')}). Your role: ${req.user.role}`
      });
    }

    next;
    next();
  };
}

/**
 * Ensures user belongs to a specific institution type
 */
export function requireInstitutionType(type) {
  return (req, res, next) => {
    if (!req.user || req.user.institution_type !== type) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${type} personnel.`
      });
    }
    next();
  };
}
