Nonterminals blocks block petri_net places_block places place transitions_block transitions transition arcs_block arcs arc.
Terminals  end_tok places_tok transitions_tok arcs_tok float integer identifier.
Rootsymbol petri_net.
Endsymbol '$end'.

petri_net -> blocks: {struct, [{elements, '$1'}]}.
blocks -> block: '$1'.
blocks -> block blocks: lists:append('$1', '$2').

block -> places_block: '$1'.
block -> transitions_block: '$1'.
block -> arcs_block: '$1'.

places_block -> places_tok places end_tok places_tok: '$2'.
places_block -> places_tok end_tok places_tok.
places -> place: ['$1'].
places -> place places: ['$1' | '$2'].
place -> identifier integer integer integer: {struct, [{element, place}, {name, list_to_binary(value_of('$1'))}, {x, value_of('$2')}, {y, value_of('$3')}, {markers, value_of('$4')}]}.

transitions_block -> transitions_tok transitions end_tok transitions_tok: '$2'.
transitions_block -> transitions_tok end_tok transitions_tok.
transitions -> transition: ['$1'].
transitions -> transition transitions: ['$1' | '$2'].
transition -> identifier integer integer integer float: {struct, [{element, transition}, {name, list_to_binary(value_of('$1'))}, {x, value_of('$2')}, {y, value_of('$3')}, {weight, value_of('$4')}, {delay, value_of('$5')}]}.

arcs_block -> arcs_tok arcs end_tok arcs_tok: '$2'.
arcs_block -> arcs_tok end_tok arcs_tok.
arcs -> arc: ['$1'].
arcs -> arc arcs: ['$1' | '$2'].
arc -> identifier identifier identifier: {struct, [{element, arc}, {name, list_to_binary(value_of('$1'))}, {from, list_to_binary(value_of('$2'))}, {to, list_to_binary(value_of('$3'))}]}.

Erlang code.
value_of(Token) ->
    element(3, Token).
