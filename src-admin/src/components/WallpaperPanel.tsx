import React from "react";
import { Alert, Box, FormControlLabel, Slider, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import { WallpaperConfig } from "../types";

interface Props {
	wallpaper: WallpaperConfig;
	onChange: (wallpaper: WallpaperConfig) => void;
}

export const DEFAULT_WALLPAPER: WallpaperConfig = {
	position: "bottom-left",
	showLocation: true,
	showTemperature: true,
	showWindDirection: false,
	showWindSpeed: false,
	fontSize: 17,
	textColor: "#ffffff",
	bgColor: "#0f172a",
	bgOpacity: 55,
};

const ColorSwatch: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
	<Box
		component="input"
		type="color"
		value={value}
		onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
		sx={{
			width: 32,
			height: 32,
			border: "1px solid",
			borderColor: "divider",
			borderRadius: 1,
			padding: "2px",
			cursor: "pointer",
			background: "none",
			flexShrink: 0,
		}}
	/>
);

const POSITIONS: WallpaperConfig["position"][] = ["top-left", "top-right", "bottom-left", "bottom-right"];

const positionStyle = (position: WallpaperConfig["position"]): React.CSSProperties => {
	const [vertical, horizontal] = position.split("-") as ["top" | "bottom", "left" | "right"];
	return {
		position: "absolute",
		[vertical]: 12,
		[horizontal]: 12,
	};
};

function hexToRgba(hex: string, opacityPercent: number): string {
	const clean = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#0f172a";
	const r = parseInt(clean.slice(1, 3), 16);
	const g = parseInt(clean.slice(3, 5), 16);
	const b = parseInt(clean.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(100, opacityPercent)) / 100})`;
}

const WallpaperPanel: React.FC<Props> = ({ wallpaper, onChange }) => {
	const w = { ...DEFAULT_WALLPAPER, ...wallpaper };

	const update = (patch: Partial<WallpaperConfig>): void => {
		onChange({ ...w, ...patch });
	};

	const previewFields: string[] = [];
	if (w.showLocation) previewFields.push(I18n.t("wallpaperPreviewLocation"));
	if (w.showTemperature) previewFields.push("18.3°C");
	if (w.showWindDirection) previewFields.push("NW");
	if (w.showWindSpeed) previewFields.push("12 km/h");

	const fontSizeInvalid = w.fontSize < 10 || w.fontSize > 48;

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Typography
				variant="body2"
				color="text.secondary"
			>
				{I18n.t("wallpaperHint")}
			</Typography>

			{previewFields.length === 0 && <Alert severity="warning">{I18n.t("wallpaperNoFieldsWarning")}</Alert>}

			{/* Live preview */}
			<Box
				sx={{
					position: "relative",
					width: 320,
					height: 180,
					borderRadius: 1,
					border: "1px solid",
					borderColor: "divider",
					background: "linear-gradient(160deg, #1e293b, #0b1120)",
					overflow: "hidden",
				}}
			>
				{previewFields.length > 0 && (
					<Box
						sx={{
							...positionStyle(w.position),
							px: 1.5,
							py: 0.75,
							borderRadius: 1,
							color: w.textColor,
							fontSize: Math.max(10, Math.min(24, w.fontSize)),
							fontWeight: 500,
							whiteSpace: "nowrap",
							background: hexToRgba(w.bgColor, w.bgOpacity),
						}}
					>
						{previewFields.join(" · ")}
					</Box>
				)}
			</Box>

			{/* Position */}
			<Box>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ display: "block", mb: 0.5 }}
				>
					{I18n.t("wallpaperPosition")}
				</Typography>
				<ToggleButtonGroup
					value={w.position}
					exclusive
					size="small"
					onChange={(_, v) => v && update({ position: v })}
				>
					{POSITIONS.map(p => (
						<ToggleButton
							key={p}
							value={p}
						>
							{I18n.t(
								p === "top-left"
									? "wallpaperPositionTopLeft"
									: p === "top-right"
										? "wallpaperPositionTopRight"
										: p === "bottom-left"
											? "wallpaperPositionBottomLeft"
											: "wallpaperPositionBottomRight",
							)}
						</ToggleButton>
					))}
				</ToggleButtonGroup>
			</Box>

			{/* Which fields */}
			<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
				<FormControlLabel
					control={
						<Switch
							size="small"
							checked={w.showLocation}
							onChange={e => update({ showLocation: e.target.checked })}
						/>
					}
					label={<Typography variant="caption">{I18n.t("wallpaperShowLocation")}</Typography>}
				/>
				<FormControlLabel
					control={
						<Switch
							size="small"
							checked={w.showTemperature}
							onChange={e => update({ showTemperature: e.target.checked })}
						/>
					}
					label={<Typography variant="caption">{I18n.t("wallpaperShowTemperature")}</Typography>}
				/>
				<FormControlLabel
					control={
						<Switch
							size="small"
							checked={w.showWindDirection}
							onChange={e => update({ showWindDirection: e.target.checked })}
						/>
					}
					label={<Typography variant="caption">{I18n.t("wallpaperShowWindDirection")}</Typography>}
				/>
				<FormControlLabel
					control={
						<Switch
							size="small"
							checked={w.showWindSpeed}
							onChange={e => update({ showWindSpeed: e.target.checked })}
						/>
					}
					label={<Typography variant="caption">{I18n.t("wallpaperShowWindSpeed")}</Typography>}
				/>
			</Box>

			{/* Font size */}
			<Box sx={{ maxWidth: 320 }}>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ display: "block", mb: 0.5 }}
				>
					{I18n.t("wallpaperFontSize")} ({w.fontSize}px)
				</Typography>
				<Slider
					value={w.fontSize}
					min={10}
					max={48}
					step={1}
					size="small"
					marks={[
						{ value: 10, label: "10" },
						{ value: 48, label: "48" },
					]}
					onChange={(_, v) => update({ fontSize: v as number })}
				/>
				<TextField
					type="number"
					size="small"
					value={w.fontSize}
					inputProps={{ min: 10, max: 48 }}
					error={fontSizeInvalid}
					helperText={fontSizeInvalid ? I18n.t("validRange", "10–48") : undefined}
					onChange={e => update({ fontSize: parseInt(e.target.value, 10) || 10 })}
					sx={{ width: 100, mt: 1 }}
				/>
			</Box>

			{/* Colors */}
			<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ width: 110, flexShrink: 0 }}
					>
						{I18n.t("wallpaperTextColor")}
					</Typography>
					<ColorSwatch
						value={w.textColor}
						onChange={v => update({ textColor: v })}
					/>
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ width: 110, flexShrink: 0 }}
					>
						{I18n.t("wallpaperBgColor")}
					</Typography>
					<ColorSwatch
						value={w.bgColor}
						onChange={v => update({ bgColor: v })}
					/>
				</Box>
				<Box sx={{ maxWidth: 320 }}>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ display: "block", mb: 0.5 }}
					>
						{I18n.t("wallpaperBgOpacity")} ({w.bgOpacity}%)
					</Typography>
					<Slider
						value={w.bgOpacity}
						min={0}
						max={100}
						step={5}
						size="small"
						marks={[
							{ value: 0, label: "0%" },
							{ value: 100, label: "100%" },
						]}
						onChange={(_, v) => update({ bgOpacity: v as number })}
					/>
				</Box>
			</Box>
		</Box>
	);
};

export default WallpaperPanel;
