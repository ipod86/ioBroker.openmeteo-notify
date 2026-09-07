import React from "react";
import {
	Alert,
	Box,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Slider,
	Switch,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
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
	showTime: false,
	fontSize: 17,
	textColor: "#ffffff",
	bgColor: "#0f172a",
	bgOpacity: 55,
	edgeMargin: 12,
	warnEnabled: true,
	warnTextColor: "#ff5252",
	warnFontSize: 20,
	carouselEnabled: false,
};

// Nur fuer die Vorschau (nicht Teil der gespeicherten Config) - simuliert eine echte
// Bildschirmaufloesung, damit Schriftgroesse/Randabstand nicht 1:1 in der kleinen
// Box landen (dort waeren 17-100px riesig), sondern proportional wie auf einem
// echten Bildschirm dieser Groesse skaliert dargestellt werden.
const PREVIEW_RESOLUTIONS: { key: string; w: number; h: number }[] = [
	{ key: "wallpaperResFullHD", w: 1920, h: 1080 },
	{ key: "wallpaperResUHD4K", w: 3840, h: 2160 },
	{ key: "wallpaperResTabletLandscape", w: 1280, h: 800 },
	{ key: "wallpaperResTabletPortrait", w: 800, h: 1280 },
	{ key: "wallpaperResPhonePortrait", w: 1080, h: 2340 },
];

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

const positionStyle = (position: WallpaperConfig["position"], edgeMargin: number): React.CSSProperties => {
	const [vertical, horizontal] = position.split("-") as ["top" | "bottom", "left" | "right"];
	return {
		position: "absolute",
		[vertical]: edgeMargin,
		[horizontal]: edgeMargin,
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
	const [resIndex, setResIndex] = React.useState(0);

	const update = (patch: Partial<WallpaperConfig>): void => {
		onChange({ ...w, ...patch });
	};

	const previewFields: string[] = [];
	if (w.showTime) previewFields.push("14:32");
	if (w.showLocation) previewFields.push(I18n.t("wallpaperPreviewLocation"));
	if (w.showTemperature) previewFields.push("18.3°C");
	if (w.showWindDirection) previewFields.push("NW");
	if (w.showWindSpeed) previewFields.push("12 km/h");

	// Skalierungsfaktor: Vorschau-Box (max. 320x260) im Verhaeltnis zur simulierten
	// echten Aufloesung - damit werden Schriftgroesse/Randabstand proportional
	// dargestellt, statt in der kleinen Box riesig/abgeschnitten zu wirken.
	const res = PREVIEW_RESOLUTIONS[resIndex];
	const scale = Math.min(320 / res.w, 260 / res.h);
	const boxW = Math.round(res.w * scale);
	const boxH = Math.round(res.h * scale);

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Typography
				variant="body2"
				color="text.secondary"
			>
				{I18n.t("wallpaperHint")}
			</Typography>

			<Alert severity="info">{I18n.t("wallpaperBgPhotoHint")}</Alert>

			{previewFields.length === 0 && <Alert severity="warning">{I18n.t("wallpaperNoFieldsWarning")}</Alert>}

			{/* Live preview */}
			<Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
				<Box
					sx={{
						position: "relative",
						width: boxW,
						height: boxH,
						borderRadius: 1,
						border: "1px solid",
						borderColor: "divider",
						background: "linear-gradient(160deg, #1e293b, #0b1120)",
						overflow: "hidden",
						flexShrink: 0,
					}}
				>
					{previewFields.length > 0 && (
						<Box
							sx={{
								...positionStyle(w.position, w.edgeMargin * scale),
								px: 1.5 * scale,
								py: 0.75 * scale,
								borderRadius: 1,
								color: w.textColor,
								fontSize: Math.max(2, w.fontSize * scale),
								fontWeight: 500,
								whiteSpace: "nowrap",
								background: hexToRgba(w.bgColor, w.bgOpacity),
							}}
						>
							{previewFields.join(" · ")}
						</Box>
					)}
					{w.warnEnabled && (
						<Box
							sx={{
								position: "absolute",
								left: 0,
								right: 0,
								...(w.position.startsWith("top") ? { bottom: 0 } : { top: 0 }),
								px: 1.5,
								py: 0.5,
								textAlign: "center",
								fontWeight: 700,
								fontSize: Math.max(2, w.warnFontSize * scale),
								color: w.warnTextColor,
								background: "rgba(0,0,0,0.35)",
							}}
						>
							⚠ {I18n.t("wallpaperPreviewWarning")}
						</Box>
					)}
				</Box>

				<FormControl
					size="small"
					sx={{ minWidth: 200 }}
				>
					<InputLabel>{I18n.t("wallpaperPreviewResolution")}</InputLabel>
					<Select
						value={resIndex}
						label={I18n.t("wallpaperPreviewResolution")}
						onChange={e => setResIndex(Number(e.target.value))}
					>
						{PREVIEW_RESOLUTIONS.map((r, i) => (
							<MenuItem
								key={r.key}
								value={i}
							>
								{I18n.t(r.key)} ({r.w}×{r.h})
							</MenuItem>
						))}
					</Select>
				</FormControl>
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
				<FormControlLabel
					control={
						<Switch
							size="small"
							checked={w.showTime}
							onChange={e => update({ showTime: e.target.checked })}
						/>
					}
					label={<Typography variant="caption">{I18n.t("wallpaperShowTime")}</Typography>}
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
					max={100}
					step={1}
					size="small"
					marks
					sx={{ width: 160 }}
					onChange={(_, v) => update({ fontSize: v as number })}
				/>
			</Box>

			{/* Edge margin */}
			<Box sx={{ maxWidth: 320 }}>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ display: "block", mb: 0.5 }}
				>
					{I18n.t("wallpaperEdgeMargin")} ({w.edgeMargin}px)
				</Typography>
				<Slider
					value={w.edgeMargin}
					min={0}
					max={100}
					step={1}
					size="small"
					marks
					sx={{ width: 160 }}
					onChange={(_, v) => update({ edgeMargin: v as number })}
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

			{/* Amtliche Warnungen als Text-Banner */}
			<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
				<Typography
					variant="subtitle2"
					sx={{ display: "block" }}
				>
					{I18n.t("wallpaperWarnSection")}
				</Typography>
				<FormControlLabel
					control={
						<Switch
							size="small"
							checked={w.warnEnabled}
							onChange={e => update({ warnEnabled: e.target.checked })}
						/>
					}
					label={<Typography variant="caption">{I18n.t("wallpaperWarnEnabled")}</Typography>}
				/>
				{w.warnEnabled && (
					<>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ width: 110, flexShrink: 0 }}
							>
								{I18n.t("wallpaperWarnTextColor")}
							</Typography>
							<ColorSwatch
								value={w.warnTextColor}
								onChange={v => update({ warnTextColor: v })}
							/>
						</Box>
						<Box sx={{ maxWidth: 320 }}>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ display: "block", mb: 0.5 }}
							>
								{I18n.t("wallpaperWarnFontSize")} ({w.warnFontSize}px)
							</Typography>
							<Slider
								value={w.warnFontSize}
								min={10}
								max={100}
								step={1}
								size="small"
								marks
								sx={{ width: 160 }}
								onChange={(_, v) => update({ warnFontSize: v as number })}
							/>
						</Box>
					</>
				)}
			</Box>

			{/* Karussell zwischen mehreren Orten */}
			<Box>
				<Typography
					variant="subtitle2"
					sx={{ display: "block", mb: 0.5 }}
				>
					{I18n.t("wallpaperCarouselSection")}
				</Typography>
				<FormControlLabel
					control={
						<Switch
							size="small"
							checked={w.carouselEnabled}
							onChange={e => update({ carouselEnabled: e.target.checked })}
						/>
					}
					label={<Typography variant="caption">{I18n.t("wallpaperCarouselEnabled")}</Typography>}
				/>
			</Box>
		</Box>
	);
};

export default WallpaperPanel;
