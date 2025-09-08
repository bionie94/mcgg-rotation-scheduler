# mcgg_rotation_scheduler.py

"""
MCGG Rotation Scheduler

This Python script lets you define player names for P1..P8, generate round-robin pairings with P1 fixed,
and print or save schedules. It's designed to be easy to edit so you can write player names in a separate
file (`players.json`) or directly into the script.

Files included (single-file repo):
- mcgg_rotation_scheduler.py  (this file)
- players.json                (optional: edit player names here)

Usage:
    # interactive prompt to enter players (press enter to use default P1..P8)
    python mcgg_rotation_scheduler.py

    # provide number of rounds to print
    python mcgg_rotation_scheduler.py 20

    # load players from players.json automatically if present

How to edit player names:
1. Option A (recommended): Open `players.json` in the repo and change the values for "P1".."P8".
   Example players.json:
   {
     "P1": "Aniq",
     "P2": "Forgiveme",
     "P3": "Sniper",
     "P4": "Prince",
     "P5": "Zra",
     "P6": "Silvia",
     "P7": "Michio",
     "P8": "Lazyhand"
   }

2. Option B: Edit the `default_players` list inside this script directly.

3. Option C: Run the script and follow the interactive prompt to type names.

This file also includes short README instructions for pushing to GitHub.

"""

import json
import os
import sys
from typing import List, Tuple

PLAYERS_JSON = 'players.json'


def load_players_from_json(path: str) -> List[str]:
    if not os.path.exists(path):
        return None
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        # Expecting keys P1..P8 or a list
        if isinstance(data, dict):
            # sort keys P1..P8
            keys = sorted(data.keys(), key=lambda k: k.upper())
            players = [data[k] for k in keys]
            return players
        elif isinstance(data, list):
            return data
    except Exception as e:
        print('Failed to load players.json:', e)
    return None


def generate_round_robin(players: List[str]) -> List[List[Tuple[str, str]]]:
    n = len(players)
    if n % 2 != 0:
        raise ValueError('Number of players must be even. Add a dummy bye if needed.')

    order = list(players)
    rounds = []
    rounds_in_cycle = n - 1

    for _ in range(rounds_in_cycle):
        pairs = []
        pairs.append((order[0], order[-1]))
        for i in range(1, n // 2):
            pairs.append((order[i], order[-i-1]))
        rounds.append(pairs)
        # rotate right the sublist excluding first element
        order = [order[0]] + [order[-1]] + order[1:-1]

    return rounds


def get_opponent_for_player_in_round(players: List[str], player: str, round_number: int):
    rounds = generate_round_robin(players)
    idx = (round_number - 1) % len(rounds)
    for a, b in rounds[idx]:
        if a == player:
            return b
        if b == player:
            return a
    return None


def print_schedule(players: List[str], total_rounds: int = None):
    rounds = generate_round_robin(players)
    cycle = len(rounds)
    if total_rounds is None:
        total_rounds = cycle

    for r in range(1, total_rounds + 1):
        idx = (r - 1) % cycle
        print(f'Round {r}')
        for a, b in rounds[idx]:
            print(f'  {a}  vs  {b}')
        print()


def prompt_for_players(default_players: List[str]) -> List[str]:
    print('
Enter player names for P1..P8. Press Enter to accept the default shown in brackets.')
    players = []
    for i, p in enumerate(default_players, start=1):
        val = input(f'P{i} [{p}]: ').strip()
        players.append(val if val else p)
    return players


if __name__ == '__main__':
    # Default baseline order (you can edit players.json or change this list)
    default_players = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']

    # try load players.json
    players = load_players_from_json(PLAYERS_JSON)
    if players:
        if len(players) % 2 != 0:
            print('players.json contains odd number of players. Please provide an even number.')
            players = None
    if not players:
        # interactive prompt: ask user if they want to enter names
        print('No players.json found or failed to load.
')
        use_prompt = input('Do you want to type player names now? (y/N): ').strip().lower()
        if use_prompt == 'y':
            players = prompt_for_players(default_players)
        else:
            players = default_players

    rounds_to_print = None
    if len(sys.argv) >= 2:
        try:
            rounds_to_print = int(sys.argv[1])
        except ValueError:
            print('Argument must be an integer: number of rounds to print.')
            sys.exit(1)

    print('
== MCGG Rotation Scheduler (P1 fixed) ==')
    print('Players (baseline order):', players)
    print()

    print_schedule(players, total_rounds=rounds_to_print)

    # Example: get opponent of P1 on round 4
    opp_r4 = get_opponent_for_player_in_round(players, players[0], 4)
    print(f'Opponent of {players[0]} on Round 4 -> {opp_r4}')


# ----------------------------- README / GitHub notes ----------------------------
# To create a GitHub repo and push this script:
# 1) Create a new folder, save this file as mcgg_rotation_scheduler.py
# 2) Optionally add players.json with keys P1..P8 or a list of names
# 3) git init
# 4) git add mcgg_rotation_scheduler.py players.json
# 5) git commit -m "Add MCGG rotation scheduler"
# 6) Create repo on GitHub and follow the instructions to add remote and push:
#    git remote add origin https://github.com/<username>/mcgg-rotation.git
#    git branch -M main
#    git push -u origin main
#
# If you want, I can also create a ready-made players.json and README.md content here
# so you can paste them into your repo. Tell me whether you want the README in Malay or English.
# --------------------------------------------------------------------------------
