import React from "react";
import {
	Alert,
	Box,
	Divider,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Switch,
	TextField,
	Typography,
} from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import { OpenMeteoConfig } from "../types";
import LocationsTable from "./LocationsTable";
import IconSetPicker from "./IconSetPicker";

interface Props {
	native: OpenMeteoConfig;
	onChange: (newNative: OpenMeteoConfig) => void;
	themeType?: string;
	namespace?: string;
}

const SettingsPanel: React.FC<Props> = ({ native, onChange, themeType, namespace }) => {
	const update = (field: keyof OpenMeteoConfig, value: any): void => {
		onChange({ ...native, [field]: value });
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			{/* Locations */}
			<Box>
				<Typography
					variant="h6"
					gutterBottom
				>
					{I18n.t("locations")}
				</Typography>
				<LocationsTable
					locations={native.locations || []}
					onChange={locs => update("locations", locs)}
					themeType={themeType}
				/>
			</Box>

			<Divider />

			{/* Forecast */}
			<Box>
				<Typography
					variant="h6"
					gutterBottom
				>
					{I18n.t("forecast")}
				</Typography>
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<TextField
						label={I18n.t("daysCount")}
						type="number"
						value={native.daysCount ?? 7}
						inputProps={{ min: 1, max: 16 }}
						onChange={e => update("daysCount", parseInt(e.target.value))}
						error={(native.daysCount ?? 7) < 1 || (native.daysCount ?? 7) > 16}
						helperText={
							(native.daysCount ?? 7) < 1 || (native.daysCount ?? 7) > 16
								? I18n.t("validRange", "1–16")
								: I18n.t("daysCountHelp")
						}
						sx={{ width: 200 }}
					/>
					<TextField
						label={I18n.t("hourlyDays")}
						type="number"
						value={native.hourlyDays ?? 3}
						inputProps={{ min: 0, max: 16 }}
						onChange={e => update("hourlyDays", parseInt(e.target.value))}
						error={(native.hourlyDays ?? 3) < 0 || (native.hourlyDays ?? 3) > (native.daysCount ?? 7)}
						helperText={
							(native.hourlyDays ?? 3) < 0 || (native.hourlyDays ?? 3) > (native.daysCount ?? 7)
								? I18n.t("hourlyDaysExceedsDaysCount")
								: (native.hourlyDays ?? 3) >= 7
									? I18n.t("hourlyDaysHighWarning")
									: I18n.t("hourlyDaysHelp")
						}
						FormHelperTextProps={{
							style: (native.hourlyDays ?? 3) >= 7 ? { color: "#ed6c02" } : undefined,
						}}
						sx={{ width: 200 }}
					/>
				</Box>
			</Box>

			<Divider />

			{/* Units */}
			<Box>
				<Typography
					variant="h6"
					gutterBottom
				>
					{I18n.t("units")}
				</Typography>
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<FormControl sx={{ width: 180 }}>
						<InputLabel>{I18n.t("temperatureUnit")}</InputLabel>
						<Select
							value={native.temperatureUnit || "celsius"}
							label={I18n.t("temperatureUnit")}
							onChange={e => update("temperatureUnit", e.target.value)}
						>
							<MenuItem value="celsius">{I18n.t("celsius")}</MenuItem>
							<MenuItem value="fahrenheit">{I18n.t("fahrenheit")}</MenuItem>
						</Select>
					</FormControl>
					<FormControl sx={{ width: 180 }}>
						<InputLabel>{I18n.t("windspeedUnit")}</InputLabel>
						<Select
							value={native.windspeedUnit || "kmh"}
							label={I18n.t("windspeedUnit")}
							onChange={e => update("windspeedUnit", e.target.value)}
						>
							<MenuItem value="kmh">km/h</MenuItem>
							<MenuItem value="ms">m/s</MenuItem>
							<MenuItem value="mph">mph</MenuItem>
							<MenuItem value="kn">kn</MenuItem>
						</Select>
					</FormControl>
					<FormControl sx={{ width: 180 }}>
						<InputLabel>{I18n.t("precipitationUnit")}</InputLabel>
						<Select
							value={native.precipitationUnit || "mm"}
							label={I18n.t("precipitationUnit")}
							onChange={e => update("precipitationUnit", e.target.value)}
						>
							<MenuItem value="mm">mm</MenuItem>
							<MenuItem value="inch">inch</MenuItem>
						</Select>
					</FormControl>
				</Box>
			</Box>

			<Divider />

			{/* Icons */}
			<Box>
				<Typography
					variant="h6"
					gutterBottom
				>
					{I18n.t("icons")}
				</Typography>
				<IconSetPicker
					iconSet={native.iconSet || "basmilius"}
					onChange={val => update("iconSet", val)}
					namespace={namespace}
				/>
			</Box>

			<Divider />

			{/* Update interval */}
			<Box>
				<Typography
					variant="h6"
					gutterBottom
				>
					{I18n.t("updateInterval")}
				</Typography>
				<FormControl sx={{ width: 200 }}>
					<InputLabel>{I18n.t("updateInterval")}</InputLabel>
					<Select
						value={native.updateInterval || 60}
						label={I18n.t("updateInterval")}
						onChange={e => update("updateInterval", Number(e.target.value))}
					>
						<MenuItem value={60}>60 {I18n.t("minutes")}</MenuItem>
						<MenuItem value={120}>120 {I18n.t("minutes")}</MenuItem>
						<MenuItem value={1440}>{I18n.t("dailyAt1am")}</MenuItem>
					</Select>
				</FormControl>
			</Box>

			{/* Live update interval - current.* + Wallpaper only, no full forecast fetch */}
			<Box>
				<Typography
					variant="h6"
					gutterBottom
				>
					{I18n.t("liveUpdateMinutes")}
				</Typography>
				<FormControl sx={{ width: 200 }}>
					<InputLabel>{I18n.t("liveUpdateMinutes")}</InputLabel>
					<Select
						value={native.liveUpdateMinutes ?? 0}
						label={I18n.t("liveUpdateMinutes")}
						onChange={e => update("liveUpdateMinutes", Number(e.target.value))}
					>
						<MenuItem value={0}>{I18n.t("liveUpdateDisabled")}</MenuItem>
						<MenuItem value={5}>5 {I18n.t("minutes")}</MenuItem>
						<MenuItem value={10}>10 {I18n.t("minutes")}</MenuItem>
						<MenuItem value={15}>15 {I18n.t("minutes")}</MenuItem>
						<MenuItem value={30}>30 {I18n.t("minutes")}</MenuItem>
					</Select>
				</FormControl>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ display: "block", mt: 0.5, maxWidth: 400 }}
				>
					{I18n.t("liveUpdateMinutesHelp")}
				</Typography>
			</Box>

			{/* 15-minute forecast (minutely_15) with its own interval and optional notification */}
			<Box>
				<Typography
					variant="h6"
					gutterBottom
				>
					{I18n.t("minutelyTitle")}
				</Typography>
				<FormControlLabel
					control={
						<Switch
							checked={!!native.minutelyEnabled}
							onChange={e => update("minutelyEnabled", e.target.checked)}
						/>
					}
					label={I18n.t("minutelyEnabled")}
				/>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ display: "block", mb: 1, maxWidth: 500 }}
				>
					{I18n.t("minutelyHelp")}
				</Typography>
				{native.minutelyEnabled && (
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
						<FormControl sx={{ width: 200 }}>
							<InputLabel>{I18n.t("minutelyInterval")}</InputLabel>
							<Select
								value={native.minutelyInterval || 15}
								label={I18n.t("minutelyInterval")}
								onChange={e => update("minutelyInterval", Number(e.target.value))}
							>
								<MenuItem value={15}>15 {I18n.t("minutes")}</MenuItem>
								<MenuItem value={30}>30 {I18n.t("minutes")}</MenuItem>
								<MenuItem value={60}>60 {I18n.t("minutes")}</MenuItem>
							</Select>
						</FormControl>
						<FormControl sx={{ width: 200 }}>
							<InputLabel>{I18n.t("minutelyHours")}</InputLabel>
							<Select
								value={native.minutelyHours || 4}
								label={I18n.t("minutelyHours")}
								onChange={e => update("minutelyHours", Number(e.target.value))}
							>
								{[1, 2, 3, 4].map(h => (
									<MenuItem
										key={h}
										value={h}
									>
										{h} {I18n.t("minutelyHoursUnit")}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				)}
				{native.minutelyEnabled && (
					<Box sx={{ mt: 1 }}>
						<FormControlLabel
							control={
								<Switch
									checked={!!native.minutelyNotify}
									onChange={e => update("minutelyNotify", e.target.checked)}
								/>
							}
							label={I18n.t("minutelyNotify")}
						/>
						{native.minutelyNotify && (
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mt: 1 }}>
								<FormControl sx={{ width: 200 }}>
									<InputLabel>{I18n.t("minutelyNotifyLead")}</InputLabel>
									<Select
										value={native.minutelyNotifyLead || 30}
										label={I18n.t("minutelyNotifyLead")}
										onChange={e => update("minutelyNotifyLead", Number(e.target.value))}
									>
										{[15, 30, 45, 60, 90, 120].map(m => (
											<MenuItem
												key={m}
												value={m}
											>
												{m} {I18n.t("minutes")}
											</MenuItem>
										))}
									</Select>
								</FormControl>
								<TextField
									sx={{ width: 200 }}
									type="number"
									label={I18n.t("minutelyNotifyThreshold")}
									value={native.minutelyNotifyThreshold ?? 0.1}
									inputProps={{ min: 0.1, max: 10, step: 0.1 }}
									onChange={e => update("minutelyNotifyThreshold", Number(e.target.value))}
								/>
							</Box>
						)}
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ display: "block", mt: 0.5, maxWidth: 500 }}
						>
							{I18n.t("minutelyNotifyHelp")}
						</Typography>
					</Box>
				)}
			</Box>

			<Divider />

			{/* Optional data */}
			<Box>
				<Typography
					variant="h6"
					gutterBottom
				>
					{I18n.t("optionalData")}
				</Typography>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
					{/* Air Quality */}
					<Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
						<FormControlLabel
							control={
								<Switch
									checked={native.enableAirQuality !== false}
									onChange={e => update("enableAirQuality", e.target.checked)}
								/>
							}
							label={I18n.t("enableAirQuality")}
							sx={{ minWidth: 280 }}
						/>
						{native.enableAirQuality !== false && (
							<FormControlLabel
								control={
									<Switch
										checked={!!native.enableAirQualityHourly}
										onChange={e => update("enableAirQualityHourly", e.target.checked)}
									/>
								}
								label={I18n.t("alsoHourly")}
							/>
						)}
					</Box>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ ml: 4, mb: 1 }}
					>
						{I18n.t("enableAirQualityHelp")}
					</Typography>

					{/* Astronomy */}
					<Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
						<FormControlLabel
							control={
								<Switch
									checked={native.enableAstronomy !== false}
									onChange={e => update("enableAstronomy", e.target.checked)}
								/>
							}
							label={I18n.t("enableAstronomy")}
							sx={{ minWidth: 280 }}
						/>
						{native.enableAstronomy !== false && (
							<FormControlLabel
								control={
									<Switch
										checked={!!native.enableAstronomyHourly}
										onChange={e => update("enableAstronomyHourly", e.target.checked)}
									/>
								}
								label={I18n.t("alsoHourly")}
							/>
						)}
					</Box>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ ml: 4, mb: 1 }}
					>
						{I18n.t("enableAstronomyHelp")}
					</Typography>

					{/* Agriculture */}
					<Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
						<FormControlLabel
							control={
								<Switch
									checked={!!native.enableAgriculture}
									onChange={e => update("enableAgriculture", e.target.checked)}
								/>
							}
							label={I18n.t("enableAgriculture")}
							sx={{ minWidth: 280 }}
						/>
						{native.enableAgriculture && (
							<FormControlLabel
								control={
									<Switch
										checked={!!native.enableAgricultureHourly}
										onChange={e => update("enableAgricultureHourly", e.target.checked)}
									/>
								}
								label={I18n.t("alsoHourly")}
							/>
						)}
					</Box>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ ml: 4, mb: 1 }}
					>
						{I18n.t("enableAgricultureHelp")}
					</Typography>

					{/* Pollen */}
					<Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
						<FormControlLabel
							control={
								<Switch
									checked={!!native.enablePollen}
									onChange={e => update("enablePollen", e.target.checked)}
								/>
							}
							label={I18n.t("enablePollen")}
							sx={{ minWidth: 280 }}
						/>
						{native.enablePollen && (
							<FormControlLabel
								control={
									<Switch
										checked={native.enablePollenHourly !== false}
										onChange={e => update("enablePollenHourly", e.target.checked)}
									/>
								}
								label={I18n.t("alsoHourly")}
							/>
						)}
					</Box>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ ml: 4, mb: 1 }}
					>
						{I18n.t("enablePollenHelp")}
					</Typography>

					{/* Comfort indices */}
					<Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
						<FormControlLabel
							control={
								<Switch
									checked={!!native.enableComfort}
									onChange={e => update("enableComfort", e.target.checked)}
								/>
							}
							label={I18n.t("enableComfort")}
							sx={{ minWidth: 280 }}
						/>
						{native.enableComfort && (
							<FormControlLabel
								control={
									<Switch
										checked={!!native.enableComfortHourly}
										onChange={e => update("enableComfortHourly", e.target.checked)}
									/>
								}
								label={I18n.t("alsoHourly")}
							/>
						)}
					</Box>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ ml: 4, mb: 1 }}
					>
						{I18n.t("enableComfortHelp")}
					</Typography>

					{/* Official warnings data */}
					<Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
						<FormControlLabel
							control={
								<Switch
									checked={!!native.warnOfficialFetch}
									onChange={e => update("warnOfficialFetch", e.target.checked)}
								/>
							}
							label={I18n.t("enableWarnOfficialFetch")}
							sx={{ minWidth: 280 }}
						/>
					</Box>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ ml: 4, mb: 1 }}
					>
						{I18n.t("enableWarnOfficialFetchHelp")}
					</Typography>
					{native.warnOfficialFetch && !native.warnOfficial && (
						<Alert
							severity="info"
							sx={{ ml: 4, maxWidth: 440 }}
						>
							{I18n.t("enableWarnOfficialFetchNotifyHint")}
						</Alert>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default SettingsPanel;
