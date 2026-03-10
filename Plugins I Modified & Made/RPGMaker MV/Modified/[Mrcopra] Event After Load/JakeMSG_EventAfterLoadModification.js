/*:
* @plugindesc Execute The Event After Successful Load
* v1.12
* @author mrcopra + JakeMSG
* 
* @param Common Event
* @desc the ID of Common Event
* @default 1
* 
* @param Should it Always Run
* @desc If you want it to always run, set this to "true", else set it to "false" (Default is True)
  @type boolean
* @default true
*
* @param Switch (if it doesn't always Run)
* @desc the ID of Switch to make the common event run only once
* @default 1
* 
* @help 
*/
 (function() {

	 
	 var parameters = PluginManager.parameters('JakeMSG_EventAfterLoadModification');
	 var ce = Number(parameters['Common Event'] || 1);
     var siar = Boolean(parameters['Should it Always Run'] || true);
	 var sw = Number(parameters['Switch'] || 1);
 
JakeMSG_SceneLoad_onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
Scene_Load.prototype.onLoadSuccess = function() {
    JakeMSG_SceneLoad_onLoadSuccess.call(this);
    if (siar || (!$gameSwitches.value(sw)) )
    {
	    $gameTemp.reserveCommonEvent(ce);
        if (!siar)
        {
            $gameSwitches.setValue(sw,true);
        }
    }
	
	
	
};
})();