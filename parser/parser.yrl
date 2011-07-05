Nonterminals blocks block petri_net places plines pline transitions tlines tline arcs alines aline settings slines.
Terminals  end_tok places_tok transitions_tok arcs_tok settings_tok flo num ident.
Rootsymbol petri_net.
Endsymbol '$end'.

petri_net -> blocks: ['$1'].
blocks -> block: '$1'.
blocks -> block blocks: '$1', '$2'.

block -> places: '$1'.
block -> transitions: '$1'.
block -> arcs: '$1'.
block -> settings: '$1'.

places -> places_tok plines end_tok places_tok: {places,  ['$2']}.
plines -> pline plines: {place, '$1'}, '$2'.
plines -> pline: {place, '$1'}.
pline -> ident num num: {'$1', '$2', '$3'}.

transitions -> transitions_tok tlines end_tok transitions_tok: {transitions, ['$2']}.
tlines -> tline tlines: {transition, '$1'}, '$2'.
tlines -> tline: {transition, '$1'}.
tline -> ident num num num flo: {'$1', '$2', '$3', '$4', '$5'}.

arcs -> arcs_tok alines end_tok arcs_tok: {arcs, ['$2']}.
alines -> aline alines: {arc, '$1'}, '$2'.
alines -> aline: {arc, '$1'}.
aline -> ident ident ident: {'$1', '$2', '$3'}.

settings -> settings_tok slines end_tok settings_tok.
slines -> '$empty'.
