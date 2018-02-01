# NSO example package, simple webui to create a trunk port

## Purpose
webui-one-example-trunk-port NSO package demonstrates how the JSON-RPC API and a simple webui can be used in combination with NSO webui-one to create custom applications.
* This package will set up a simple trunk between two swithces.
* The package is based on a NSO service template.
* This application is based on a template for use with Cisco ios devices.

## Package contents
* __src/yang/example-trunk-port.yang__ Yang service definition.
* __templates/example-trunk-port-template.xml__ Config template for Cisco ios device used with the service.
* __webui/webui.json__ Required for the package to be recognised by the NSO webui and a link to the package webui will be visible on the ApplicationHUB.
* __webui/index.html__ Required entrypoint for the package webui, where the user will end up when clicking on the link in the ApplicationHUB.
* __webui/script.js__ Simple Javascript to peform a request to the NSO JSON-RPC.
* __webui/style.css__ CSS Styles.

## Requirements
* NSO version 4.5+
* A modern version of Chrome or Firefox
* cisco-ios ned package
  * Available in NSO-install/packages/neds/cisco-ios, copy to your NSO/packages folder.
  * Run _make_ in the copied cisco-ios/src folder.
* At least 1 Cisco device, 2 for a more authentic example. Real device or netsim.
  * For netsim device look in NSO User Guide, chapter "The Network Simulator"

## Installation
__Download and set up__
* Download and put the package contents in the NSO `packages/webui-one-example-trunk-port` folder.
* You have to source nso to reach nso commands like ncs_cli
  * _source NSO-install-folder/nsoenv_
* in `webui-one-example-trunk-port/src/` run _make_

__Reload packages using cli or webui.__
* CLI: start ncs_cli
  * run _request packages reload_
* WEBUI: In your browser go to http://NSO-HOST/webui-one/ConfigurationEditor/ncs:packages/reload
  * Click "Run reload action"

__You have to restart NSO__
* Restart NSO

The example-webui should now be accessible from the ApplicationHUB, _nso-host/webui-one/_ or
directly at _nso-host/custom/webui-one-example-trunk-port_

## Usage
Create a new trunk configuration:
* Give the config a name "MyNewTrunk".
* Fill in devices, ports and vlan-id.
* Submit with "Create/Update Trunk from values" 
* Go to the webui-one commit manager to see changes in NSO and Device config.
