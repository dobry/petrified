all: places.beam simulation.beam transition.beam
	mkdir -p ../nitrogen/lib/simulation
	cp places.beam simulation.beam transition.beam ../nitrogen/lib/simulation/

simulation.beam: simulation.erl
	../nitrogen/erts-5.8.1/bin/erl -compile simulation.erl

places.beam: places.erl
	../nitrogen/erts-5.8.1/bin/erl -compile places.erl

transition.beam: transition.erl
	../nitrogen/erts-5.8.1/bin/erl -compile transition.erl

clean:
	rm *.beam
