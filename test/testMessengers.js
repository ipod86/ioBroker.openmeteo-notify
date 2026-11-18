"use strict";
const { describe, it } = require("mocha");
const { expect } = require("chai");
const { MESSENGERS, sendToMessenger, listMessengers } = require("../lib/messengers");

function fakeHost() {
	const calls = [];
	return {
		calls,
		sendTo: (inst, cmd, msg) => calls.push({ inst, cmd, msg }),
		setForeignStateAsync: async (id, val, ack) => calls.push({ id, val, ack }),
		getObjectViewAsync: async () => ({
			rows: ["telegram.0", "admin.0", "gotify.0", "notification-manager.0", "ai-assistant.0"].map(i => ({
				id: `system.adapter.${i}`,
			})),
		}),
	};
}
const msg = { title: "Open-Meteo", text: "Sturm in Berlin", alert: true };

describe("messengers", () => {
	it("knows the 13 supported messengers", () => {
		expect(Object.keys(MESSENGERS)).to.have.length(13);
	});
	it("lists only installed supported instances", async () => {
		const list = await listMessengers(fakeHost());
		expect(list.map(l => l.value)).to.deep.equal(["gotify.0", "telegram.0"]);
	});
	it("telegram keeps user and chatId of old rows", async () => {
		const h = fakeHost();
		await sendToMessenger(h, { instance: "telegram.0", user: "Anna", chatId: "" }, msg);
		expect(h.calls[0]).to.deep.equal({
			inst: "telegram.0",
			cmd: "send",
			msg: { text: "Sturm in Berlin", user: "Anna" },
		});
	});
	it("rejects unsupported adapters and missing required fields", async () => {
		const h = fakeHost();
		let err = "";
		await sendToMessenger(h, { instance: "foo.0" }, msg).catch(e => (err = e.message));
		expect(err).to.match(/not supported/);
		await sendToMessenger(h, { instance: "gsmsms.0" }, msg).catch(e => (err = e.message));
		expect(err).to.match(/phone/);
		await sendToMessenger(h, { instance: "discord.0" }, msg).catch(e => (err = e.message));
		expect(err).to.match(/user or channel/);
		expect(h.calls).to.have.length(0);
	});
	it("builds each format", async () => {
		const h = fakeHost();
		await sendToMessenger(h, { instance: "pushover.0" }, msg);
		await sendToMessenger(h, { instance: "gsmsms.0", phone: "+49170" }, msg);
		await sendToMessenger(h, { instance: "discord.0", channel: "1/2" }, msg);
		await sendToMessenger(h, { instance: "discord.0", user: "123" }, msg);
		await sendToMessenger(h, { instance: "max.0" }, msg);
		await sendToMessenger(h, { instance: "iot.0", device: "iPhone A, iPhone B" }, msg);
		await sendToMessenger(h, { instance: "synochat.0", channel: "home" }, msg);
		await sendToMessenger(h, { instance: "whatsapp-cmb.0" }, { ...msg, text: "Open-Meteo: x" });
		expect(h.calls[0].msg).to.deep.equal({ message: "Sturm in Berlin", title: "Open-Meteo", priority: 1 });
		expect(h.calls[1].msg).to.deep.equal({
			text: "Open-Meteo: Sturm in Berlin",
			recipient: "+49170",
			alert: false,
		});
		expect(h.calls[2]).to.include({ cmd: "sendMessage" });
		expect(h.calls[2].msg).to.include({ serverId: "1", channelId: "2" });
		expect(h.calls[3].msg).to.include({ userId: "123" });
		expect(h.calls[4].msg).to.equal("Open-Meteo: Sturm in Berlin");
		expect(JSON.parse(h.calls[5].val)).to.deep.equal({
			message: "Sturm in Berlin",
			title: "Open-Meteo",
			priority: "high",
			devices: JSON.stringify(["iPhone A", "iPhone B"]),
		});
		expect(h.calls[5]).to.include({ id: "iot.0.app.message", ack: false });
		expect(h.calls[6]).to.deep.equal({
			id: "synochat.0.home.message",
			val: "Open-Meteo: Sturm in Berlin",
			ack: false,
		});
		expect(h.calls[7].msg).to.deep.equal({ text: "Open-Meteo: x" });
	});
});
