#RemoteBox API (www.ea4tx.com)
---


|  Command | Description|
|---|---|
|``O``|  Returns the name and model of the device |
|``S``|  Returns the antenna status* |
|``X``|  Trace ON/OFF. Enables/Disables debug messages|
|``FI``| Returns the name and status of antennas|
|``1R[N]X``| Set antenna [N] for Radio1 X=0 Off / X=1 On|
|``2R[N]X`| Set antenna [N] for Radio1 X=0 Off / X=1 On|

* *Status message syntax:
    For one Radio models:
    ``SW1:<X,X,X,X,X,X,X,X>``
    For two radio models also:
    ``SW2:<X,X,X,X,X,X,X,X>``
    
