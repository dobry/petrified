-module(transition).
-export([init/1, init_arcs/1]).
-include("net_records.hrl").

init(Attrs) ->
  %io:format("Transition lauched:~p~n", [Attrs]),
  [{<<"id">>, Id} | [{<<"name">>, Name} | [{<<"x">>, Left} | [{<<"y">>, Top} | [{<<"delay">>, Delay} | [{<<"priority">>, Priority} | [_Angle]]]]]]] = Attrs,
  Tr = #transition {
    id = Id,
    name = Name,
    left = Left,
    top = Top,
    delay = Delay
  },
  {Id, spawn(transition, init_arcs, [Tr]), Priority}.

init_arcs(Tr) ->
  %io:format("Transition lauched:~p~n", [Tr]),
  receive
    {from, To, W} ->
      New_tr = Tr#transition{arcs_from = [{To, W} | Tr#transition.arcs_from]},
      init_arcs(New_tr);
    {to, From, W} ->
      New_tr = Tr#transition{arcs_to = [{From, -W} | Tr#transition.arcs_to]},
      init_arcs(New_tr);
    ready ->
      pause(Tr)
  end.

loop(Tr) ->
  %io:format("Transition ready:~p~n", [Tr]),
  receive
    pause ->
      pause(Tr);
    stop ->
      ok;
    Other ->
      io:format("danger! danger! ~p got ~p in wrong time.", [Tr, Other]),
      loop(Tr) % but continue
  after 500 ->
    %io:format("transition ~p: check~n", [self()]),
    Res = places:check(lists:append(Tr#transition.arcs_from, Tr#transition.arcs_to)),
    case Res of
      stop ->
        io:format("transition: stopped~n");
      ok_launched ->
        io:format("transition ~p: launched~n", [Tr#transition.id]),
        %io:format("transition ~p: out, loopin'~n", [Tr]),
        loop(Tr);
      not_possible ->
        %ok,
        io:format("transition ~p: not launched~n", [Tr#transition.id]),
        %io:format("transition ~p: out, loopin'~n", [Tr]),
        loop(Tr);
      Other ->
        io:format("danger! transition ~p: got ~p~n", [self(), Other]),
        %io:format("transition ~p: out, loopin'~n", [Tr]),
        loop(Tr)
    end
  end.

pause(Tr) ->
  receive
    stop ->
      ok;
    play ->
      io:format("play:~p~n", [Tr]),
      loop(Tr)
  end.
