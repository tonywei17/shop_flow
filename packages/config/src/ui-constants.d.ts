/**
 * @enterprise/config - UI Constants
 *
 * Configurable UI constants including badge colors, status labels,
 * price types, and other display-related settings.
 */
import type { UIConstants, BadgeColor, StatusBadge, DataScopeOption } from "./types";
/**
 * Price type options for role/pricing configuration
 */
export declare const DEFAULT_PRICE_TYPES: Array<{
    value: string;
    label: string;
}>;
/**
 * Available badge colors for roles and other entities
 */
export declare const DEFAULT_BADGE_COLORS: BadgeColor[];
/**
 * Data scope options for role configuration
 */
export declare const DEFAULT_DATA_SCOPE_OPTIONS: DataScopeOption[];
/**
 * Default status badge configurations
 */
export declare const DEFAULT_STATUS_BADGES: Record<string, StatusBadge>;
/**
 * Complete default UI constants
 */
export declare const DEFAULT_UI_CONSTANTS: UIConstants;
/**
 * Clear the UI constants cache
 */
export declare function clearUIConstantsCache(): void;
/**
 * Get the current UI constants
 */
export declare function getUIConstants(): UIConstants;
/**
 * Get price type options
 */
export declare function getPriceTypes(): Array<{
    value: string;
    label: string;
}>;
/**
 * Get badge color options
 */
export declare function getBadgeColors(): BadgeColor[];
/**
 * Get data scope options
 */
export declare function getDataScopeOptions(): DataScopeOption[];
/**
 * Get status badges
 */
export declare function getStatusBadges(): Record<string, StatusBadge>;
/**
 * Get a specific status badge by key
 */
export declare function getStatusBadge(status: string): StatusBadge | undefined;
/**
 * Get badge color by value
 */
export declare function getBadgeColorByValue(value: string): BadgeColor | undefined;
/**
 * Get badge class name for a color value
 */
export declare function getBadgeClassName(colorValue: string): string;
/**
 * Override UI constants with custom values
 */
export declare function setUIConstants(constants: Partial<UIConstants>): void;
