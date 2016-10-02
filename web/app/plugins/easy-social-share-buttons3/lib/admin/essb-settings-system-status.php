<?php 

include_once ESSB3_PLUGIN_ROOT . 'lib/admin/essb-debug-counters-helper.php';

?>

<style type="text/css">

.debug-out {
	border: 0px !important;
	background: #f5f7f9;
}

</style>

<div class="essb-options essb-options-shortcodegen">
	<div class="essb-options-header" id="essb-options-header">
		<div class="essb-options-title">
					<?php _e('System Status', 'essb')?>
				</div>
	</div>
	<div class="essb-options-sidebar" style="display: none;">
		<ul class="essb-options-group-menu">
		</ul>
	</div>
	<div class="essb-options-container">
		<div id="essb-container-1" class="essb-data-container"
			style="padding: 10px;">

		<?php
		
		$active_tab = isset ( $_REQUEST ["usertab"] ) ? $_REQUEST ["usertab"] : "system-0";
		
		ESSBOptionsFramework::draw_tabs_start ( array (__ ( "<i class='fa fa-database'></i> System Status", "essb" ), __ ( "<i class='fa fa-refresh'></i> Share Counter Test", "essb" ) ), array ("element_id" => "system" ) );
		ESSBOptionsFramework::draw_tab_start ( array ("element_id" => "system-0", "active" => ($active_tab == "system-0" ? "true" : "false") ) );
		
		?>
		
<?php
if (! function_exists ( 'get_plugins' )) {
	require_once ABSPATH . 'wp-admin/includes/plugin.php';
}
$plugins = get_plugins ();
$pluginList = '';
$is_even = true;
foreach ( $plugins as $plugin ) {
	// print_r($plugin);
	$pluginList .= '<tr class="' . ($is_even ? "even" : "odd") . ' table-border-bottom">';
	$pluginList .= '<td><b>' . $plugin ['Name'] . '</b><br/><span class="label">slug: ' . $plugin ['TextDomain'] . ', author: <a href="' . $plugin ['AuthorURI'] . '" target="_blank">' . $plugin ['Author'] . '</a></span></td>';
	$pluginList .= '<td><b>' . $plugin ['Version'] . '</b><br/><a href="' . $plugin ['PluginURI'] . '" target="_blank">' . $plugin ['PluginURI'] . '</a>';
	$pluginList .= '</tr>';

}

if (function_exists ( 'fsockopen' )) {
	$fsockopen = '<span style="color:green;">Enabled</span>';
} else {
	$fsockopen = '<span style="color:red;">Disabled</span>';
}
if (function_exists ( 'curl_version' )) {
	$curl_version = curl_version ();
	$curl_status = '<span style="color:green;">Enabled: v' . $curl_version ['version'] . '</span>';
} else {
	$curl_status = '<span style="color:red;">Disabled</span>';
}
$theme = wp_get_theme ();
$system_status = '
<table style="width:100%; margin-top: 20px;" cellspacing="0" cellpadding="3" border="0">
<col width="30%"/><col width="70%"/>
<tr><td class="sub4" colspan="2"><div>Environment Statuses</div></td><td></td></tr>
<tr class="even table-border-bottom"><td ><b>Home URL</b></td><td>' . get_home_url () . '</td></tr>
<tr class="odd table-border-bottom"><td ><b>Site URL</b></td><td>' . get_site_url () . '</td></tr>
<tr class="even table-border-bottom"><td><b>WordPress Version</b></td><td>' . get_bloginfo ( 'version' ) . '</td></tr>
<tr class="odd table-border-bottom"><td><b>PHP Version</b></td><td>' . phpversion () . '</td></tr>
<tr class="even table-border-bottom"><td><b>WP Memory Limit</b></td><td>' . WP_MEMORY_LIMIT . '</td></tr>
<tr class="odd table-border-bottom"><td><b>Easy Social Share Buttons version</b></td><td>' . ESSB3_VERSION . '</td></tr>
<tr><td class="sub4" colspan="2"><div>Connection Statuses</div></td><td></td></tr>
<tr class="even table-border-bottom"><td><b>fsockopen</b></td><td>' . $fsockopen . '</td></tr>
<tr class="odd table-border-bottom"><td><b>cURL</b></td><td>' . $curl_status . '</td></tr>
<tr><td class="sub4" colspan="2"><div>Plugin Statuses</div></td><td></td></tr>
<tr class="even table-border-bottom"><td><b>Theme Name</b></td><td>' . $theme ['Name'] . '</td></tr>
<tr class="odd table-border-bottom"><td><b>Theme Version</b></td><td>' . $theme ['Version'] . '</td></tr>
<tr><td colspan="2" class="sub5"><div>Active Plugins</div></td><td></td></tr>
<tr class="even table-border-bottom"><td><b>Number of Active Plugins</b></td><td>' . count ( $plugins ) . '</td></tr>
' . $pluginList . '
</table>
';

echo $system_status;

?>
				
				<?php
				
				ESSBOptionsFramework::draw_tab_end ();
				
				ESSBOptionsFramework::draw_tab_start ( array ("element_id" => "system-1", "active" => ($active_tab == "system-1" ? "true" : "false") ) );
				
				$url = isset($_REQUEST['url']) ? $_REQUEST['url'] : '';
				?>
				
				<form method="GET" action="">
				<input type="hidden" name="usertab" value="system-1" />
				<input type="hidden" name="page" value="essb_redirect_status"/>

				<table style="width: 100%; margin-top: 20px; margin-bottom: 20px;"
					cellspacing="0" cellpadding="3" border="0">
					<col width="30%" />
					<col width="70%" />
					<tr class="even table-border-bottom">
						<td class="bold">Enter URL to test:</td>
						<td><input type="text" name="url" class="input-element"
							style="width: 70%;" value="<?php echo $url; ?>" /> <input type="submit" value="Start test"
							class="essb-btn essb-btn-red" /></td>
					</tr>
					
					<?php 
					
					
					
					if ($url != '') {
						print '<tr><td class="sub4" colspan="2"><div>Social API response test</div></td></tr>';
						
						$networks = array("facebook", "twitter", "google", "linkedin", "pinterest", "google", "stumbleupon", "vk", "reddit", "buffer", "ok", "mwp", "xing", "pocket", "yummly");
						$networks_data = essb_available_social_networks();
						
						foreach ($networks as $key) {
							$data = isset($networks_data[$key]) ? $networks_data[$key] : array();
							$network_name = isset($data['name']) ? $data['name'] : $key;
							
							print '<tr><td class="sub5" colspan="2"><div>'.$network_name.'</div></td></tr>';
							ESSBDebugCountersHelper::get_shared_counter($key, $url);
						}
					}
					
					?>
					
				</table>

			</form>
				
				<?php
				ESSBOptionsFramework::draw_tab_end ();
				
				ESSBOptionsFramework::draw_tabs_end ();
				
				?>
				
				</div>
	</div>
</div>


