window.onload = function() {
    const userBtn = document.getElementById('userid-researcher');
    const webhookBtn = document.getElementById('webhook-researcher');
    const guildBtn = document.getElementById('guild-researcher')

    userBtn.onclick = () => {
        userBtn.classList.add('active');
        webhookBtn.classList.remove('active');
        guildBtn.classList.remove('active');

        renderUserIdForm();
    };

    webhookBtn.onclick = () => {
        webhookBtn.classList.add('active');
        userBtn.classList.remove('active');
        guildBtn.classList.remove('active');
        
        renderWebhookArea();
    };

    guildBtn.onclick = () => {
        guildBtn.classList.add('active');
        webhookBtn.classList.remove('active');
        userBtn.classList.remove('active');

        renderGuildArea();
    };

    userBtn.classList.add('active');
    renderUserIdForm();
};

function dataFormat(dataISO) {
    const data = new Date(dataISO);
    
    return data.toLocaleString('en', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(',', '');
}

function renderUserIdForm() {
    document.getElementById('main-title').textContent = 'UserID Researcher';
    document.getElementById('dynamic-content').innerHTML = `
        <form id="userid-form" autocomplete="off">
            <label for="userid">Discord User ID:</label>
            <input type="text" id="userid" name="userid" placeholder="Enter User ID" required>
            <button type="submit">Search</button>
        </form>
        <div class="result" id="result"></div>
    `;
    
    document.getElementById('userid-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const user_id = document.getElementById('userid').value.trim();
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = 'Searching...';
        
        try {
            const res = await fetch(`https://discordlookup.mesalytic.moe/v1/user/${user_id}`);
            const data = await res.json();
            
            if (data.error || data.message || !res.ok) {
                if (data.message === "Value is not a valid Discord snowflake") {
                    resultDiv.innerHTML = '<span style="color:red;">Error: Value is not a valid Discord snowflake</span>';
                } else if (data.message === "Unknown User" && data.code === 10013) {
                    resultDiv.innerHTML = '<span style="color:red;">Error: Unknown User (ID may not exist or account was deleted)</span>';
                } else if (data.error) {
                    resultDiv.innerHTML = `<span style="color:red;">${data.error}</span>`;
                } else if (!res.ok) {
                    resultDiv.innerHTML = `<span style="color:red;">API Error: HTTP ${res.status} ${res.statusText}</span>`;
                } else {
                    resultDiv.innerHTML = '<span style="color:red;">Unknown error while searching for user</span>';
                }
                return;
            }
            
            resultDiv.innerHTML = `
                <strong>ID: </strong> ${data.id}<br>
                <strong>Username: </strong> ${data.username}<br>
                <strong>Global Name: </strong> ${data.global_name || '-'}<br>
                <strong>Created at: </strong> ${dataFormat(data.created_at)}<br>
                <strong>Badges: </strong> ${data.badges && data.badges.length ? data.badges.join(', ') : 'None'}<br>
                <strong>Accent Color: </strong> ${data.accent_color || '-'}<br>
                <br>
                <strong>Avatar:</strong> <a href="${data.avatar?.link}" target="_blank">${data.avatar?.link}</a><br>
                <strong>Animated: </strong>${data.avatar?.is_animated}<br>
                <br>
                <strong>Banner: </strong> <a href="${data.banner?.link}" target="_blank">${data.banner?.link}</a><br>
                <strong>Animated: </strong>${data.banner?.is_animated}<br>
                <br>
                <strong>Clan tag: </strong>${data.raw?.clan?.tag || 'None'}<br>
                <strong>Clan ID: </strong>${data.raw?.clan?.identity_guild_id || 'None'}<br>
                <strong>Tag enabled: </strong>${data.raw?.clan?.identity_enabled}<br>
                <strong>Badge: </strong>${data.raw?.clan?.badge}
            `;
        } catch (error) {
            resultDiv.innerHTML = '<span style="color:red;">Error searching for user information</span>';
            console.error('Error:', error);
        }
    });
}

function renderWebhookArea() {
    document.getElementById('main-title').textContent = 'WebHook Functions';
    document.getElementById('dynamic-content').innerHTML = `
        <div style="margin-bottom:16px;display:flex;gap:8px;">
            <button type="button" id="wh-validate">Validate Webhook</button>
            <button type="button" id="wh-send">Send Message</button>
            <button type="button" id="wh-delete">Delete Webhook</button>
        </div>
        <div id="webhook-form-area"></div>
    `;
    document.getElementById('wh-validate').onclick = renderWebhookValidate;
    document.getElementById('wh-send').onclick = renderWebhookSend;
    document.getElementById('wh-delete').onclick = renderWebhookDelete;
}

function renderWebhookValidate() {
    document.getElementById('main-title').textContent = 'WebHook Validator';
    document.getElementById('dynamic-content').innerHTML = `
        <form id="webhook-validate-form" autocomplete="off">
            <label for="wbhook">Discord Webhook:</label>
            <input type="text" id="webhook-url" name="webhook" placeholder="Type the Webhook URL" required>
            <button type="submit">Search</button>
        </form>
        <div class="result" id="result"></div>
    `;

    document.getElementById('webhook-validate-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const webhookUrl = document.getElementById('webhook-url').value.trim();
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = 'Searching...';
        try {
            const res = await fetch(webhookUrl);
            const data = await res.json();
            if (data.error) {
                resultDiv.innerHTML = `<span style="color:red;">${data.error}</span>`;
                return;
            }
            resultDiv.innerHTML = `
                <strong>ID: </strong>${data.id}<br>
                <strong>Name: </strong>${data.name}<br>
                <strong>Token: </strong>${data.token}<br>
                <strong>Application ID: </strong>${data.application_id}<br>
                <strong>Avatar: </strong>${data.avatar}<br>
                <br>
                <strong>Channel ID: </strong>${data.channel_id}<br>
                <strong>Guild ID: </strong>${data.guild_id}<br>
                <strong>Type: </strong>${data.type}<br>
                <strong>URL: </strong> <a href="${data.url}" target="_blank">${data.url}</a><br>
                `;
        } catch {
            resultDiv.innerHTML = '<span style="color:red;">Error searching for user.</span>';
        }
    });
}

function renderWebhookSend() {
    document.getElementById('main-title').textContent = 'WebHook Sender';
    document.getElementById('dynamic-content').innerHTML = `
        <form id="webhook-sender-form" autocomplete="off">
            <label for="webhook-url">Discord Webhook URL:</label>
            <input type="text" id="webhook-url" placeholder="Type the Webhook URL" required>

            <label for="webhook-username">Webhook Name (optional):</label>
            <input type="text" id="webhook-username" placeholder="Webhook username">

            <label for="webhook-avatar">Webhook avatar (optional, URL):</label>
            <input type="text" id="webhook-avatar" placeholder="Webhook avatar URL">

            <label for="message-title">Title (optional):</label>
            <input type="text" id="message-title" placeholder="Title of the embed">

            <label for="message-content">Message:</label>
            <input type="text" id="message-content" placeholder="Message content">

            <label for="message-json">Custom JSON (optional):</label>
            <textarea 
                id="message-json" 
                rows="5" 
                style="
                    width: 100%;
                    min-height: 100px;
                    font-family: monospace;
                    padding: 8px;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                    resize: vertical;
                    box-sizing: border-box;
                "
                placeholder='Ex: {"content":"Hello!", "embeds": [{"title":"Title"}]}'
            ></textarea>

            <label for="message-file">Upload file (optional):</label>
            <input type="file" id="message-file">

            <br>
            <button type="submit">Send</button>
        </form>
        <div class="result" id="result"></div>
    `;

    document.getElementById('webhook-sender-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const url = document.getElementById('webhook-url').value.trim();
        const username = document.getElementById('webhook-username').value.trim();
        const avatar = document.getElementById('webhook-avatar').value.trim();
        const title = document.getElementById('message-title').value.trim();
        const message = document.getElementById('message-content').value.trim();
        const jsonInput = document.getElementById('message-json').value.trim();
        const fileInput = document.getElementById('message-file');
        const resultDiv = document.getElementById('result');

        let body;

        if (jsonInput) {
            try {
                body = JSON.parse(jsonInput);
            } catch {
                resultDiv.innerHTML = '<span style="color:red;">JSON inválido.</span>';
                return;
            }
        } else {
            body = {
                username: username || undefined,
                avatar_url: avatar || undefined,
                embeds: title ? [{ 
                    title: title, 
                    description: message || undefined 
                }] : undefined,
                content: !title ? message || undefined : undefined
            };
        }

        resultDiv.innerHTML = 'Sending...';

        try {
            let response;
            if (fileInput.files[0]) {
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                formData.append('payload_json', JSON.stringify(body));
                response = await fetch(url, {
                    method: 'POST',
                    body: formData
                });
                fileInput.value = '';
            } else {
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            }

            if (response.ok) {
                resultDiv.innerHTML = '<span style="color:limegreen;">Message sent successfully!</span>';
            } else {
                const data = await response.json().catch(() => ({}));
                resultDiv.innerHTML = `<span style="color:red;">Erro: ${data.message || 'Failed to send'}</span>`;
            }
        } catch {
            resultDiv.innerHTML = '<span style="color:red;">Error sending message.</span>';
        }
    });
}

function renderWebhookDelete() {
    document.getElementById('main-title').textContent = 'WebHook Deleter';
    document.getElementById('dynamic-content').innerHTML = `
        <form id="webhook-validate-form" autocomplete="off">
            <label for="webhook-url">Discord Webhook:</label>
            <input type="text" id="webhook-url" placeholder="Type the Webhook URL" required>
            
            <label>
                <input type="checkbox" id="send-message"> Send message before deleting
            </label>
            
            <div id="message-options" style="display: none; margin-top: 10px;">
                <label for="deleter-msg">Message (optional):</label>
                <textarea 
                    id="deleter-msg" 
                    rows="5" 
                    style="
                        width: 100%;
                        min-height: 100px;
                        font-family: monospace;
                        padding: 8px;
                        border-radius: 4px;
                        border: 1px solid #ccc;
                        resize: vertical;
                        box-sizing: border-box;
                    "
                    placeholder='Ex: {"content":"Webhook deleted!", "embeds": [{"title":"Deleted", "description":"This webhook was removed", "color":16711680}]}'
                ></textarea>
            </div>
            
            <button type="submit">Delete</button>
        </form>
        <div class="result" id="result"></div>
    `;

    document.getElementById('send-message').addEventListener('change', function() {
        document.getElementById('message-options').style.display = this.checked ? 'block' : 'none';
    });

    document.getElementById('webhook-validate-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const webhookUrl = document.getElementById('webhook-url').value.trim();
        const sendMessage = document.getElementById('send-message').checked;
        const deleterMsg = document.getElementById('deleter-msg')?.value.trim();
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = 'Processing...';

        try {
            // First check if webhook exists
            const checkRes = await fetch(webhookUrl);
            const webhookData = await checkRes.json();
            
            if (webhookData.error) {
                resultDiv.innerHTML = `<span style="color:red;">${webhookData.error}</span>`;
                return;
            }

            if (sendMessage) {
                let deleteMessage;
                
                if (deleterMsg) {
                    try {
                        // Try to parse as JSON
                        deleteMessage = JSON.parse(deleterMsg);
                    } catch {
                        // If not valid JSON, use as plain text
                        deleteMessage = {
                            embeds: [{
                                title: "Webhook deleted!",
                                description: deleterMsg,
                                color: 16711680, // Red color
                                footer: {
                                    text: "github.com/diogolourencodev"
                                }
                            }]
                        };
                    }
                } else {
                    // Default message if none provided
                    deleteMessage = {
                        embeds: [{
                            title: "Webhook deleted!",
                            description: "This webhook has been deleted.",
                            color: 16711680,
                            footer: {
                                text: "github.com/diogolourencodev"
                            }
                        }]
                    };
                }

                // Send the message
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(deleteMessage)
                });
            }

            // Delete the webhook
            const deleteRes = await fetch(webhookUrl, {
                method: 'DELETE'
            });

            if (deleteRes.ok) {
                resultDiv.innerHTML = `
                    <span style="color:limegreen;">Webhook deleted successfully!</span><br><br>
                    <strong>ID: </strong>${webhookData.id}<br>
                    <strong>Name: </strong>${webhookData.name}<br>
                    <strong>Channel ID: </strong>${webhookData.channel_id}<br>
                    <strong>Guild ID: </strong>${webhookData.guild_id}<br>
                `;
            } else {
                throw new Error('Failed to delete webhook');
            }
        } catch (error) {
            resultDiv.innerHTML = `<span style="color:red;">Error: ${error.message || 'Failed to delete webhook'}</span>`;
        }
    });
}

function renderGuildArea() {
    document.getElementById('main-title').textContent = 'Guild Functions';
    document.getElementById('dynamic-content').innerHTML = `
        <div style="margin-bottom:16px;display:flex;gap:8px;">
            <button type="button" id="invite-validate">Validate Invitation</button>
        </div>
        <div id="webhook-form-area"></div>
    `;
    document.getElementById('invite-validate').onclick = renderInviteValidate;
}

function renderInviteValidate() {
    document.getElementById('main-title').textContent = 'Invite Validator';
    document.getElementById('dynamic-content').innerHTML = `
        <form id="invite-validate-form" autocomplete="off">
            <label for="guildinvite">Guild Invite:</label>
            <input type="text" id="invite-id" name="inviteid" placeholder="Invite ID" required>
            <button type="submit">Search</button>
        </form>

        <h3>Guild</h3>
        <div class="result" id="result-guild"></div>

        <h3>Invite</h3>
        <div class="result" id="result-invite"></div>

        <h3>Inviter</h3>
        <div class="result" id="result-inviter"></div>
    `;

    document.getElementById('invite-validate-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const invite = document.getElementById('invite-id').value.trim();
        const inviteID = "https://discord.com/api/v10/invites/" + invite;
    
        const resultGuild = document.getElementById('result-guild');
        const resultInvite = document.getElementById('result-invite');
        const resultInviter = document.getElementById('result-inviter');
    
        resultGuild.innerHTML = 'Searching...';
        try {
            const res = await fetch(inviteID);
            
            if (!res.ok) {
                const errorData = await res.json();
                if (errorData.code === 10006) {
                    resultGuild.innerHTML = `<span style="color:red;">Erro: Unknown or invalid invitation.</span>`;
                } else {
                    resultGuild.innerHTML = `<span style="color:red;">API Error: ${errorData.message || 'Unknown error'}</span>`;
                }
                return;
            }
    
            const data = await res.json();
            const dataGuild = data.guild;
            const dataGuildProfile = data.profile;
            const dataChannel = data.channel;
            const dataInviter = data.inviter;
    
            if (!dataGuild) {
                resultGuild.innerHTML = `<span style="color:red;">Error: Guild data not found in response</span>`;
                return;
            }
    
            resultGuild.innerHTML = `
                <style>
                .guild-info strong {
                    display: block;
                    margin-bottom: 4px;
                }
                
                .guild-info a {
                    display: inline-block;
                    border: 1px solid #5865F2;
                    border-radius: 4px;
                    padding: 2px 6px;
                    text-decoration: none;
                    color: #5865F2;
                    background-color: transparent;
                    transition: all 0.3s ease-in-out;
                }
                
                .guild-info a:hover {
                    background-color: #5865F2;
                    color: white;
                    box-shadow: 0 2px 4px rgba(88, 101, 242, 0.3);
                }
                ul {
                    list-style: none;
                }
                </style>
    
                <ul class="guild-info">
                    <li><strong>Name:</strong> ${dataGuild.name || 'None'}</li>
                    <li><strong>Description:</strong> ${dataGuild.description || 'None'}</li>
                    <li><strong>Members:</strong> ${dataGuildProfile?.member_count || 'None'}</li>
                    <li><strong>Online members:</strong> ${dataGuildProfile?.online_count || 'None'}</li>
                    <li><strong>Boosts:</strong> ${dataGuild.premium_subscription_count || 'None'}</li>
                    <li><strong>Tag:</strong> ${dataGuildProfile?.tag || 'None'}</li>
                    <li><strong>Icon:</strong> ${dataGuild.icon ? `<a href="https://cdn.discordapp.com/icons/${dataGuild.id}/${dataGuild.icon}" target="_blank">Icon here</a>` : 'None'}</li>
                    <li><strong>Banner:</strong> ${dataGuild.banner ? `<a href="https://cdn.discordapp.com/banners/${dataGuild.id}/${dataGuild.banner}" target="_blank">Banner here</a>` : 'None'}</li>
                    <li><strong>Verification level:</strong> ${dataGuild.verification_level || 'None'}</li>
                    <li><strong>NSFW:</strong> ${dataGuild.nsfw || 'None'}</li>
                </ul>
            `;
            
            resultInvite.innerHTML = `
                <style>
                .invite-info strong {
                    display: block;
                    margin-bottom: 4px;
                }
                
                .invite-info a {
                    display: inline-block;
                    border: 1px solid #5865F2;
                    border-radius: 4px;
                    padding: 2px 6px;
                    text-decoration: none;
                    color: #5865F2; /* Cor do texto igual à borda */
                    background-color: transparent; /* Fundo transparente inicial */
                    transition: all 0.3s ease-in-out; /* Transição suave de 0.3s */
                }
                
                .invite-info a:hover {
                    background-color: #5865F2;
                    color: white; /* Texto branco no hover */
                    box-shadow: 0 2px 4px rgba(88, 101, 242, 0.3); /* Sombra saborosa */
                }
                ul {
                    list-style: none;
                }
                </style>
                <ul class="invite-info">
                    <li><strong>Code: </strong>${data.code}</li>
                    <li><strong>Expires at: </strong>${data.expires_at ? dataFormat(data.expires_at) : 'Never'}</li>
                    <li><strong>Channel: </strong> <a href="https://discord.com/channels/${dataGuild.id}/${dataChannel.id}" target="_blank">#${dataChannel.name}</a></li>
                </ul>
            `;

            resultInviter.innerHTML = `
                <style>
                .inviter-info strong {
                    display: block;
                    margin-bottom: 4px;
                }
                
                .inviter-info a {
                    display: inline-block;
                    border: 1px solid #5865F2;
                    border-radius: 4px;
                    padding: 2px 6px;
                    text-decoration: none;
                    color: #5865F2;
                    background-color: transparent;
                    transition: all 0.3s ease-in-out;
                }
                
                .inviter-info a:hover {
                    background-color: #5865F2;
                    color: white;
                    box-shadow: 0 2px 4px rgba(88, 101, 242, 0.3);
                }
                ul {
                    list-style: none;
                }
                </style>
                <ul class="inviter-info">
                    <li><strong>ID: </strong> ${dataInviter.id}</li>
                    <li><strong>Username: </strong> ${dataInviter.username}</li>
                    <li><strong>Global Name: </strong> ${dataInviter.global_name || '-'}</li>
                    <li><strong>Accent Color: </strong> ${dataInviter.accent_color || '-'}</li>
                    
                    <li><strong>Avatar:</strong> <a href="https://cdn.discordapp.com/avatars/${dataInviter.id}/${dataInviter.avatar}" target="_blank">Avatar here</a></li>
                    <img src="https://cdn.discordapp.com/avatars/${dataInviter.id}/${dataInviter.avatar}" alt="" srcset="">
                    
                    <li><strong>Banner: </strong> <a href="https://cdn.discordapp.com/banners/${dataGuild.id}/${dataInviter.banner}" target="_blank">Banner here</a></li>
                    <img src="https://cdn.discordapp.com/banners/${dataInviter.id}/${dataInviter.banner}" alt="" srcset="">
                    
                    <li><strong>Clan tag: </strong>${dataInviter.clan?.tag || 'None'}</li>
                    <li><strong>Clan ID: </strong>${dataInviter.clan?.identity_guild_id || 'None'}</li>
                    <li><strong>Tag enabled: </strong>${dataInviter.clan?.identity_enabled}</li>
                </ul>
            `;

        } catch {
            resultGuild.innerHTML = '<span style="color:red;">Error.</span>';
        }

    });
}
