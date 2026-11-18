import React from "react";
import {
	Alert,
	Autocomplete,
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	IconButton,
	Switch,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import { MessengerRow, OpenMeteoConfig } from "../types";

interface Props {
	native: OpenMeteoConfig;
	onChange: (newNative: OpenMeteoConfig) => void;
	/** admin connection, for the list of messengers and the test message */
	socket: any;
	/** e.g. openmeteo-notify.0 */
	namespace: string;
	notificationManagerInstalled?: boolean;
	notificationManagerRunning?: boolean;
}

/** Where the notifications go: the ioBroker notification system and/or chosen messengers */
const MessengersPanel: React.FC<Props> = ({
	native,
	onChange,
	socket,
	namespace,
	notificationManagerInstalled,
	notificationManagerRunning,
}) => {
	const [options, setOptions] = React.useState<string[]>([]);
	const [testResult, setTestResult] = React.useState<{ ok: boolean; text: string } | null>(null);
	const rows: MessengerRow[] = native.messengers || [];
	const managerOn = native.notifyManager !== false;

	React.useEffect(() => {
		let gone = false;
		void socket
			?.sendTo(namespace, "getMessengers", {})
			.then((res: { value: string }[] | undefined) => {
				if (!gone && Array.isArray(res)) {
					setOptions(res.map(r => r.value));
				}
			})
			.catch(() => {
				/* the adapter does not run: free input still works */
			});
		return () => {
			gone = true;
		};
	}, [socket, namespace]);

	const setRows = (next: MessengerRow[]): void => onChange({ ...native, messengers: next });
	const setRow = (i: number, patch: Partial<MessengerRow>): void =>
		setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

	const test = (): void => {
		setTestResult(null);
		void socket
			?.sendTo(namespace, "testMessengers", { messengers: rows })
			.then((res: { result?: number; error?: string } | undefined) => {
				if (res?.error) {
					setTestResult({ ok: false, text: res.error });
				} else {
					setTestResult({ ok: true, text: I18n.t("messengersTestSent", String(res?.result ?? 0)) });
				}
			})
			.catch((e: Error) => setTestResult({ ok: false, text: e.message }));
	};
	const active = rows.filter(r => r.instance && r.enabled !== false).length;

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
			<Typography variant="h6">{I18n.t("messengersHeader")}</Typography>
			<Typography
				variant="body2"
				color="text.secondary"
			>
				{I18n.t("messengersIntro")}
			</Typography>

			<FormControlLabel
				control={
					<Switch
						checked={managerOn}
						onChange={e => onChange({ ...native, notifyManager: e.target.checked })}
					/>
				}
				label={I18n.t("notifyManagerLabel")}
			/>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ ml: 4, mt: -1 }}
			>
				{I18n.t("notifyManagerHelp")}
			</Typography>
			{managerOn && notificationManagerInstalled === false && (
				<Alert severity="warning">{I18n.t("notificationManagerMissingHint")}</Alert>
			)}
			{managerOn && notificationManagerInstalled === true && notificationManagerRunning === false && (
				<Alert severity="warning">{I18n.t("notificationManagerNotRunningHint")}</Alert>
			)}
			{managerOn && notificationManagerInstalled === true && notificationManagerRunning === true && (
				<Alert severity="info">{I18n.t("notificationManagerFoundHint")}</Alert>
			)}

			<Typography
				variant="subtitle1"
				sx={{ mt: 2 }}
			>
				{I18n.t("messengersTableHeader")}
			</Typography>
			<Typography
				variant="caption"
				color="text.secondary"
			>
				{I18n.t("messengersHelp")}
			</Typography>
			{rows.map((r, i) => (
				<Box
					key={i}
					sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
				>
					<Tooltip title={I18n.t("messengerActive")}>
						<Checkbox
							checked={r.enabled !== false}
							onChange={e => setRow(i, { enabled: e.target.checked })}
						/>
					</Tooltip>
					<Autocomplete
						freeSolo
						size="small"
						sx={{ width: 220 }}
						options={options}
						value={r.instance || ""}
						onChange={(_e, v) => setRow(i, { instance: String(v || "") })}
						onInputChange={(_e, v) => setRow(i, { instance: v })}
						renderInput={params => (
							<TextField
								{...params}
								label={I18n.t("messengerInstance")}
							/>
						)}
					/>
					<TextField
						size="small"
						sx={{ width: 180 }}
						label={I18n.t("messengerUser")}
						value={r.user || ""}
						onChange={e => setRow(i, { user: e.target.value })}
					/>
					<TextField
						size="small"
						sx={{ width: 180 }}
						label={I18n.t("messengerChatId")}
						value={r.chatId || ""}
						onChange={e => setRow(i, { chatId: e.target.value })}
					/>
					<Tooltip title={I18n.t("messengerDelete")}>
						<IconButton
							aria-label={I18n.t("messengerDelete")}
							onClick={() => setRows(rows.filter((_r, j) => j !== i))}
						>
							✕
						</IconButton>
					</Tooltip>
				</Box>
			))}
			<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
				<Button
					variant="outlined"
					onClick={() => setRows([...rows, { enabled: true, instance: options[0] || "", user: "", chatId: "" }])}
				>
					{I18n.t("messengerAdd")}
				</Button>
				<Button
					variant="outlined"
					disabled={!active}
					onClick={test}
				>
					{I18n.t("messengersTest")}
				</Button>
			</Box>
			{testResult && <Alert severity={testResult.ok ? "success" : "error"}>{testResult.text}</Alert>}
			{!managerOn && !active && <Alert severity="warning">{I18n.t("messengersNoneHint")}</Alert>}
		</Box>
	);
};

export default MessengersPanel;
