export const PERMISSIONS = {
    'pin': {
        canCreateListings: true,
        canViewPersonalStats: true,
    },
    'csr_rep': {
        canViewAllListings: true,
        canViewCSRStats: true,
    },
    'platform_manager': {
        canViewPlatformStats: true,
        canViewAllListings: true,
    },
    'user_admin': {
        canViewUserLog: true
    },
}

export const hasPermission = (userRole, permission) => {
    return PERMISSIONS[userRole]?.[permission] || false
}