-module(simulation).
-export([init/1, group_elements/1]).
-include("net_records.hrl").

init(List) ->
  %io:format("TT~pTT~n", [List]),
  %{ok, _Places, _Transitions, _Arcs} = 
  Res = group_elements(List),
  %io:format("TT~pTT~n", [Res]),
  %places:init(Places).
  ok.

% splits list of net elements to three lists:
% - Places
% - Transitions
% - Arcs
group_elements(List) ->
  group_elements([], [], [], List).

group_elements(Places, Transitions, Arcs, []) ->
  {ok, Places, Transitions, Arcs};
group_elements(Places, Transitions, Arcs, [{struct, Attributes} | List]) ->
  %io:format("TT~pTT~nSS~pSS~n", [Attributes, List]),
  case Attributes of
    [] ->
      group_elements(Places, Transitions, Arcs, List);
    [Type | Attr] ->
      case Type of
        {<<"element">>, <<"place">>} ->
          group_elements([Attr | Places], Transitions, Arcs, List);
        {<<"element">>, <<"transition">>} ->
          group_elements(Places, [Attr | Transitions], Arcs, List);
        {<<"element">>, <<"arc">>} ->
          group_elements(Places, Transitions, [Attr | Arcs], List)
        %TODO: remove this after debugging
        %Other ->
        %  io:format("group_elements error: ~p~n", [Other]),
        %  {ok, [], [], []}
      end
  end.
