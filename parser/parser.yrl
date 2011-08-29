Nonterminals blocks block petri_net places_block places place transitions_block transitions transition arcs_block arcs arc settings_block.
Terminals  end_tok places_tok transitions_tok arcs_tok settings_tok float integer identifier.
Rootsymbol petri_net.
Endsymbol '$end'.

petri_net -> blocks: '$1'.
blocks -> block: ['$1'].
blocks -> block blocks: ['$1' | '$2'].

block -> places_block: '$1'.
block -> transitions_block: '$1'.
block -> arcs_block: '$1'.
block -> settings_block: '$1'.

places_block -> places_tok places end_tok places_tok: {places,  '$2'}.
places_block -> places_tok end_tok places_tok: {places,  []}.
places -> place: ['$1'].
places -> place places: ['$1' | '$2'].
place -> identifier integer integer: {value_of('$1'), value_of('$2'), value_of('$3')}.

transitions_block -> transitions_tok transitions end_tok transitions_tok: {transitions, '$2'}.
transitions_block -> transitions_tok end_tok transitions_tok: {transitions, []}.
transitions -> transition: ['$1'].
transitions -> transition transitions: ['$1' | '$2'].
transition -> identifier integer integer integer float: {value_of('$1'), value_of('$2'), value_of('$3'), value_of('$4'), value_of('$5')}.

arcs_block -> arcs_tok arcs end_tok arcs_tok: {arcs, '$2'}.
arcs_block -> arcs_tok end_tok arcs_tok: {arcs, []}.
arcs -> arc: ['$1'].
arcs -> arc arcs: ['$1' | '$2'].
arc -> identifier identifier identifier: {value_of('$1'), value_of('$2'), value_of('$3')}.

settings_block -> settings_tok end_tok settings_tok.

Erlang code.
value_of(Token) ->
    element(3, Token). 
