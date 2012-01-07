all: places.beam simulation.beam
	mkdir -p ../nitrogen/lib/simulation
	cp places.beam simulation.beam ../nitrogen/lib/simulation/

simulation.beam: simulation.erl
	../nitrogen/erts-5.8.1/bin/erl -compile simulation.erl

places.beam: places.erl
	../nitrogen/erts-5.8.1/bin/erl -compile places.erl

clean:
	rm *.beam
