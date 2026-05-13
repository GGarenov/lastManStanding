/**
 * Utility functions for user display and avatars
 */

import type { AuthUser } from '~/store/authStore';

/**
 * Get display name for a user, preferring username over email
 * @param user - User object with optional username and email
 * @returns Display name (username, email prefix, or fallback)
 */
export function getUserDisplayName(user: { username?: string; email?: string } | null | undefined): string {
  if (!user) return 'Guest';
  if (user.username) return user.username;
  if (user.email) return user.email.split('@')[0];
  return 'User';
}

/**
 * Get avatar initials from username or email
 * @param user - User object with optional username and email
 * @returns First letter(s) for avatar display
 */
export function getAvatarInitials(user: { username?: string; email?: string } | null | undefined): string {
  if (!user) return 'G';
  
  const source = user.username || user.email || '';
  if (!source) return 'U';
  
  // If username or email has multiple words, use first letters of first two words
  const parts = source.split(/[\s._-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  
  // Otherwise use first letter (or first two if single character)
  return source.slice(0, 2).toUpperCase();
}

/**
 * Get avatar background color based on username or email
 * Generates a consistent color for the same user
 */
export function getAvatarColor(user: { username?: string; email?: string } | null | undefined): string {
  if (!user) return 'bg-primary/20';
  
  const source = user.username || user.email || 'default';
  // Simple hash function to generate consistent color
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = source.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate hue (0-360) from hash
  const hue = Math.abs(hash) % 360;
  
  // Use HSL with fixed saturation and lightness for consistent appearance
  return `hsl(${hue}, 70%, 50%)`;
}
