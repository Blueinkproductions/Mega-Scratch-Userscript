// ==UserScript==
// @name		Mega Scratch Userscript (base/bootstrap)
// @author		MegaScratchUserscript (collab with some Scratch ATers: https://github.com/MegaScratchUserscript/Mega-Scratch-Userscript#-mega-scratch-userscript)
// @description	A mega userscript with tons of epic uses!
// @include		http://scratch.mit.edu/*
// @version		0.1
// @grant		unsafeWindow
// @grant		GM_getResourceText
// @grant		GM_addStyle
// @icon		resources/icon.png
// @require		https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require		https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js
// @require		resources/waitForKeyElements.js
// @require		resources/msuinit.js
// @require		resources/extensions.js
// @require		parts/scratchforum.part.js
// @require		parts/scratchtheme.part.js
// @require		parts/scratchystuff.part.js
// @require		parts/feed.part.js
// @resource	settingshtml resources/settings.htmlpart
// @resource	settingscss resources/settings.css
// ==/UserScript==

// I called this base.user.js in case this is the main script
var ScratchUserscript = {
    MODE_DEV: true, // change to false in the release; use this flag to print data to console for debug, etc
	_settingsHTML: $("<div id='msu-settings-dialog' title='MegaScratchUserscript Settings'></div>"),
	_partsEnabled: {},
	_init: function(){
		if(typeof localStorage != 'undefined'){
			if(typeof localStorage.msuPartsEnabled == 'undefined'){
				localStorage.msuPartsEnabled = "{}";
			}
			ScratchUserscript._partsEnabled = JSON.parse(localStorage.msuPartsEnabled);
		}
		ScratchUserscript._settingsHTML.css("display","none").appendTo(document.body).dialog({autoOpen: false, width: 800, height: 400});
		$("#msu-settings-dialog").parent().append('<iframe class="iframeshim" frameborder="0" scrolling="no">&lt;html&gt;&lt;head&gt;&lt;/head&gt;&lt;body&gt;&lt;/body&gt;&lt;/html&gt;</iframe>');
		ScratchUserscript._settingsHTML.html(GM_getResourceText("settingshtml"));
		GM_addStyle(GM_getResourceText("settingscss"));
		var openSettings = $("<a href='javascript:void(0)'><acronym title='Mega Scratch Userscript'>MSU</acronym> Settings</a>");
		openSettings.click(function(){
			ScratchUserscript._settingsHTML.dialog("open");
		});
		$("<li></li>").append(openSettings).insertBefore($(".user-nav .logout"));
		
		for(x in unsafeWindow.msuParts){
			if(typeof unsafeWindow.msuParts[x] !== "undefined"){
				(unsafeWindow.msuParts[x])(ScratchUserscript);
			}
		}
		if(ScratchUserscript.MODE_DEV){
			console.log("Scratchuserscript started!");
		}
	},
	readSetting: function(partName, settingName, defaultValue){
		if(typeof localStorage != 'undefined'){
			var settings = {};
			if(typeof localStorage.msuSettingsStorage != 'undefined'){
				settings = JSON.parse(localStorage.msuSettingsStorage);
			}
			if(settings.hasOwnProperty(partName+"-"+settingName)){
				return settings[partName+"-"+settingName];
			} else return defaultValue;
		}
	},
	writeSetting: function(partName, settingName, settingValue){
		if(typeof localStorage != 'undefined'){
			var settings = {};
			if(typeof localStorage.msuSettingsStorage != 'undefined'){
				settings = JSON.parse(localStorage.msuSettingsStorage);
			}
			settings[partName+"-"+settingName] = settingValue;
			localStorage.msuSettingsStorage = JSON.stringify(settings);
		}
	},
	/**
	 * Returns if a part is enabled (as per the settings GUI)
	 * It's up to parts to call this and check
	 * @return true if enabled, false otherwise
	 */
	isPartEnabled: function(name){
		if(!ScratchUserscript._partsEnabled.hasOwnProperty(name.replace(/[^a-zA-Z\d]/g, "").toLowerCase())){
			return true; // not in the object = enabled
		}
		if(ScratchUserscript._partsEnabled[name.replace(/[^a-zA-Z\d]/g, "").toLowerCase()]){
			return true;
		}
		return false;
	},
	/**
	 * Registers a part of the userscript onto the settings dialog
	 * @param name The name of the part
	 * @param description A description
	 * @param settings HTML for the part's settings page, if any
	 */
	registerPart: function(name, description, settings){
		// almost verbatim copied from my test JSFiddle: http://jsfiddle.net/a8cewv3u/
		// very messy, should be cleaned up
		
		var qualifiedName = name.replace(/[^a-zA-Z\d]/g, "").toLowerCase();
		if(ScratchUserscript.MODE_DEV)
			console.log("Part registered name="+name+" qualifiedName="+qualifiedName);
		var li = $("<li></li>");
		var isEnabled = ScratchUserscript.isPartEnabled(name);
		li.append($("<input data-ischeck='yup' type='checkbox' title='Enable this' id='enable-" + qualifiedName + "' data-for='" + qualifiedName + "' />")
				.bind('change', function () {
			ck = $(this).is(":checked");
			$("#isenabled-" + $(this).attr("data-for")).text(ck ? "yes":"no");
			ScratchUserscript._partsEnabled[$(this).attr("data-for")] = ck;
			if(typeof localStorage != 'undefined'){
				localStorage.msuPartsEnabled = JSON.stringify(ScratchUserscript._partsEnabled);
			}
		}).attr("checked", isEnabled));
		li.append($("<label for='enable-'" + qualifiedName + "'>" + name + "</label>").attr("data-for", qualifiedName));
		li.click(function (e) {
			if ($(e.target).attr("data-ischeck") == 'yup') return;
			ScratchUserscript._settingsHTML.find(".msu-settings-content-div").slideUp();
			ScratchUserscript._settingsHTML.find("#msu-settings-content-" + $(this).find("label").attr("data-for")).slideDown();
			ScratchUserscript._settingsHTML.find(".msu-settings-side-tabs li").removeClass("sel");
			$(this).addClass("sel");
		});
		ScratchUserscript._settingsHTML.find(".msu-settings-side-tabs").append(li);
		var content = $("<div></div>");
		content.append("<h3>" + name + "</h3>").append("<b>Enabled:</b> <span id='isenabled-" + qualifiedName + "'>no</span><br/>");
		if(isEnabled) content.find("#isenabled-"+qualifiedName).text("yes");
		content.append("<b>Description:</b> "+description + "<div class='msu-settings-divider'></div>")
			.append(settings == null ? "<i>No additional settings</i>" : settings);
		content.attr("id", "msu-settings-content-" + qualifiedName)
			.css("display", "none").addClass("msu-settings-content-div")
			.appendTo(ScratchUserscript._settingsHTML.find(".msu-settings-content"));
		if(ScratchUserscript._settingsHTML.find('.msu-settings-side-tabs li.sel').length==0){
			li.addClass("sel");
			content.show();
		}
	},
	/**
	 * Gets the page type
	 * @return The type, in the form of a JSON object:
	 *		type: either project, studio, messages, mystuff, settings, forum, or unknown
	 *		subtype: in forums, either section, topic, or null
	 *  	id: the forum topic id, project id, studio id, etc
	 */
	getPageType: function(){
		var obj = {type: "unknown", subtype: null, id: null};
		if (/^\/projects\/\d+\/$/.test(location.pathname)){
			obj.type = "project";
			obj.id = parseInt(/^\/projects\/(\d+)\/$/.exec(location.pathname)[1]);
		}
		if (/^\/studios\/\d+\/$/.test(location.pathname)){
			obj.type = "studio";
			obj.id = parseInt(/^\/studios\/(\d+)\/$/.exec(location.pathname)[1]);
		}
		if(/^\/discuss\//.test(location.pathname)){
			obj.type = "forum";
			if(/^\/discuss\/\d+\/$/.test(location.pathname)){
				obj.subtype = "section";
				obj.id = parseInt(/^\/discuss\/(\d+)\/$/.exec(location.pathname)[1]);
			}
			if(/^\/discuss\/topic\/\d+\//.test(location.pathname)){
				obj.subtype = "topic";
				obj.id = parseInt(/^\/discuss\/topic\/(\d+)\//.exec(location.pathname)[1]);
			}
		}
		if (/^\/accounts\/(password_change|email_change|change_country)\/$/.test(location.pathname)){
			obj.type = "settings";
		}
		if (location.pathname == '/messages/'){
			obj.type = "messages";
		}
		if (location.pathname == '/mystuff/'){
			obj.type = "mystuff";
		}
		return obj;
	},
	/**
	 * @return The username of the currently logged in user, or null if not logged in
	 */
	getUsername: function(){
		return unsafeWindow.Scratch.INIT_DATA.LOGGED_IN_USER.model ? unsafeWindow.Scratch.INIT_DATA.LOGGED_IN_USER.model.username : null;
	}
};

$(document).ready(ScratchUserscript._init);
