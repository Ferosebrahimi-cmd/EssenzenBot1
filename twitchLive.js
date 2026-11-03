
const { EmbedBuilder } = require("discord.js");

const CHANNEL_ID = "1516549300497154112";
const ROLE_ID = "1516549297728917691";
const STREAMERS = ["040rafi", "colin_kaan"];
const INTERVAL = 60_000;

let token = null;
let tokenExpiry = 0;

async function getToken() {
    if (token && Date.now() < tokenExpiry) return token;

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: "client_credentials",
        }),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
        throw new Error("Twitch-Login fehlgeschlagen. Prüfe die Variablen.");
    }

    token = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return token;
}

async function twitchRequest(url) {
    const accessToken = await getToken();

    const response = await fetch(url, {
        headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Twitch API Fehler: HTTP ${response.status}`);
    }

    return response.json();
}

async function getStream(login) {
    const data = await twitchRequest(
        `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(login)}`
    );

    return data.data?.[0] || null;
}

async function getUserProfile(login) {
    const data = await twitchRequest(
        `https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`
    );

    return data.data?.[0] || null;
}

function startTwitchMonitor(client) {
    const liveStatus = new Map(
        STREAMERS.map((name) => [name, false])
    );

    let checking = false;

    async function checkStreams() {
        if (checking) return;
        checking = true;

        try {
            const channel = await client.channels.fetch(CHANNEL_ID);

            if (!channel || !channel.isTextBased() ||
                typeof channel.send !== "function") {
                throw new Error("Discord-Benachrichtigungskanal nicht gefunden.");
            }

            for (const login of STREAMERS) {
                try {
                    const stream = await getStream(login);
                    const isLive = Boolean(stream);
                    const wasLive = liveStatus.get(login);

                    if (isLive && !wasLive) {
                        const profile = await getUserProfile(login);
                        const displayName =
                            profile?.display_name || stream.user_name || login;

                        const embed = new EmbedBuilder()
                            .setColor(0x9146FF)
                            .setTitle(`🔴 ${displayName} ist jetzt live!`)
                            .setURL(`https://www.twitch.tv/${login}`)
                            .setDescription(
                                `**Streamtitel:**\n${stream.title || "Jetzt live!"}\n\n` +
                                `**Kategorie:** ${stream.game_name || "Keine Angabe"}`
                            )
                            .setTimestamp(new Date());

                        if (profile?.profile_image_url) {
                            embed.setThumbnail(profile.profile_image_url);
                        }

                        if (stream.thumbnail_url) {
                            embed.setImage(
                                stream.thumbnail_url
                                    .replace("{width}", "640")
                                    .replace("{height}", "360")
                            );
                        }

                        await channel.send({
                            content: `<@&${ROLE_ID}>`,
                            embeds: [embed],
                            allowedMentions: { roles: [ROLE_ID] },
                        });

                        console.log(
                            `[Twitch] Benachrichtigung gesendet: ${login}`
                        );
                    }

                    liveStatus.set(login, isLive);
                } catch (error) {
                    console.error(`[Twitch] ${login}:`, error.message);
                }
            }
        } catch (error) {
            console.error("[Twitch] Monitor:", error.message);
        } finally {
            checking = false;
        }
    }

    console.log("[Twitch] Monitor gestartet:", STREAMERS.join(", "));
    void checkStreams();
    setInterval(() => void checkStreams(), INTERVAL);
}

module.exports = { startTwitchMonitor };

