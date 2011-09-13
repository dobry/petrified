Nonterminals petri_net blocks block place transition arc attributes attribute.
Terminals  end_tok place_tok transition_tok arc_tok float integer identifier.
Rootsymbol petri_net.
Endsymbol '$end'.

petri_net -> blocks: '$1'.
blocks -> block: ['$1'].
blocks -> block blocks: ['$1' | '$2'].

block -> place: '$1'.
block -> transition: '$1'.
block -> arc: '$1'.

place -> place_tok attributes end_tok: {struct, [{element, place} | '$2']}.

transition -> transition_tok attributes end_tok: {struct, [{element, transition} | '$2']}.

arc -> arc_tok attributes end_tok: {struct, [{element, arc} | '$2']}.

attributes -> attribute attributes: ['$1' | '$2'].
attributes -> attribute: ['$1'].

attribute -> identifier integer: {list_to_binary(value_of('$1')), value_of('$2')}.
attribute -> identifier float: {list_to_binary(value_of('$1')), value_of('$2')}.
attribute -> identifier identifier: {list_to_binary(value_of('$1')), list_to_binary(value_of('$2'))}.

Erlang code.
value_of(Token) ->
    element(3, Token).
