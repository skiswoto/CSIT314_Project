export const PERMISSIONS = {
    'pin': {
        canViewAllListings: true,
        canCreateListings: true,
        canViewPersonalStats: true,
    },
    'csr_rep': {
        canViewAllListings: true,
        canViewCSRStats: true,
        canApplyListing: true,
        canSaveListing: true
    },
    'platform_manager': {
        canViewAllListings: true,
        canViewPlatformStats: true,
    },
    'user_admin': {
        canViewAllListings: true,
        canViewUserLog: true
    },
}

export const hasPermission = (userRole, permission) => {
    return PERMISSIONS[userRole]?.[permission] || false
}