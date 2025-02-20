var CCOF = CCOF || {};
CCOF.AdjudicationCCFRIFacility = CCOF.AdjudicationCCFRIFacility || {};
CCOF.AdjudicationCCFRIFacility.Form = CCOF.AdjudicationCCFRIFacility.Form || {};
CCOF.AdjudicationCCFRIFacility.Form = {
	onLoad: function (executionContext) {
		debugger;
		let formContext = executionContext.getFormContext();
		let appCCFRI = formContext.getAttribute("ccof_applicationccfri").getValue();
		if (appCCFRI !== null) {
			let appCCFRIid = appCCFRI[0].id;
			let appCCFRIReq = "ccof_applicationccfris(" + getCleanedGuid(appCCFRIid) + ")?$select=ccof_feecorrectccfri";
			let appCCFRIResponse = getSyncSingleRecord(appCCFRIReq);
			// 100000000  Yes 100000001 No
			if (appCCFRIResponse["ccof_feecorrectccfri"] === 100000000) {
				formContext.ui.tabs.get("Adjudication").setVisible(true);
				formContext.ui.tabs.get("MonthAdjudication").setVisible(false);
			}
			else {
				formContext.ui.tabs.get("Adjudication").setVisible(false);
				formContext.ui.tabs.get("MonthAdjudication").setVisible(true);
			}
		}
		HideAdjudicatorRecommendationOptions(executionContext);

		formContext.getAttribute("ccof_afcconfirmedbyqc").addOnChange(onChange_confirmedbyqc);
		formContext.getAttribute("ccof_afcconfirmedbycommittee").addOnChange(onChange_confirmedbyconfirmedbycommittee);
		formContext.getAttribute("ccof_afcsenttoexecutive").addOnChange(onChange_senttoexecutive);
		formContext.getAttribute("ccof_afcreviewedbyexecutive").addOnChange(onChange_reviewedbyexecutive);
		//
		//var tabMonthAdjudication = formContext.ui.tabs.get("MonthAdjudication");
		//tabMonthAdjudication.addTabStateChange(refreshMedianGrid(executionContext));
		// setTimeout(refreshMedianGrid(executionContext), 4000);
	},
}
function refreshMedianGrid(executionContext) {
	debugger;
	var formContext = executionContext.getFormContext();
	var quickViewContext = formContext.ui.quickForms.get("QuickviewControlMedian24");
	//var median = quickViewContext.getAttribute("ccof_region3pctmedian").getValue();
	var grid = quickViewContext.getControl("Subgrid_Median");
	var fetchData = {
		"statecode": "0",
		"ccof_median_fee_sdaid": "b1b2e1ec-a254-ed11-9560-000d3af4fbcb"
	};
	var fetchXml = [
		"<fetch>",
		"  <entity name='ccof_median_fee_sda'>",
		"    <filter>",
		"      <condition attribute='statecode' operator='eq' value='", fetchData.statecode/*0*/, "'/>",
		"      <condition attribute='ccof_median_fee_sdaid' operator='eq' value='", fetchData.ccof_median_fee_sdaid/*b1b2e1ec-a254-ed11-9560-000d3af4fbcb*/, "' uitype='ccof_median_fee_sda'/>",
		"    </filter>",
		"  </entity>",
		"</fetch>"
	].join("");
	if (!grid) {
		setTimeout(refreshMedianGrid, 2000);
		return;
	};
	grid.setFilterXml(fetchXml);
	grid.refresh();

}
function getCleanedGuid(id) {
	return id.replace("{", "").replace("}", "");
}

function getSyncSingleRecord(request) {
	var results = null;
	var req = new XMLHttpRequest();
	req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/" + request, false);
	req.setRequestHeader("OData-MaxVersion", "4.0");
	req.setRequestHeader("OData-Version", "4.0");
	req.setRequestHeader("Accept", "application/json");
	req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
	req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
	req.onreadystatechange = function () {
		if (this.readyState === 4) {
			req.onreadystatechange = null;
			if (this.status === 200) {
				var result = JSON.parse(this.response);
				results = result;
			}
			else {
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return results;
}

function HideAdjudicatorRecommendationOptions(executionContext) {
	var today = new Date();
	var limitDate = new Date('2023/03/31'); //FY 2023/24
	var formContext = executionContext.getFormContext();
	//Remove Stage 2(NOM) and Stage 2 (MED) automatically for the FY 2023/24
	if (today > limitDate) {
		formContext.getControl("ccof_adjudicatorrecommendation").removeOption(100000010); //Stage 2 (NOM)
		formContext.getControl("ccof_adjudicatorrecommendation").removeOption(100000011); //Stage 2 (MED)
	}
}


function onChange_confirmedbyqc(executionContext) {
	setUserAndDate(executionContext, "ccof_afc_updatedbyconfirmedbyqc", "ccof_afc_updatedonconfirmedbyqc");
}

function onChange_confirmedbyconfirmedbycommittee(executionContext) {
	setUserAndDate(executionContext, "ccof_afc_updatebyconfirmedbycommittee", "ccof_afc_updateonconfirmedbycommittee");
}

function onChange_senttoexecutive(executionContext) {
	setUserAndDate(executionContext, "ccof_afc_updatedbysenttoexecutive", "ccof_afc_updatedonsenttoexecutive");
}

function onChange_reviewedbyexecutive(executionContext) {
	setUserAndDate(executionContext, "ccof_afc_updatedbyreviewedbyexecutive", "ccof_afc_updatedonreviewedbyexecutive");
}

//Get the current user and Date Now
function setUserAndDate(executionContext, userField, dateField) {
	var formContext = executionContext.getFormContext();
	var userSettings = Xrm.Utility.getGlobalContext().userSettings;
	var date_time = new Date();
	var userLookup = new Array();
	userLookup[0] = new Object();
	userLookup[0].id = userSettings.userId;
	userLookup[0].entityType = "systemuser";
	formContext.getAttribute(userField).setValue(userLookup);
	formContext.getAttribute(dateField).setValue(date_time);
}