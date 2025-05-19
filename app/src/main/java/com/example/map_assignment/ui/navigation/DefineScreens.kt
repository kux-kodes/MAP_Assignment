package com.example.map_assignment.ui.navigation

sealed class DefineScreens(val route: String){
    data object HomeScreen : DefineScreens("home_screen")
    data object EventScreen: DefineScreens("event_screen")
    data object StatsScreen: DefineScreens("stats_screen")
    data object TeamScreen: DefineScreens("team_screen")
    data object MoreScreen: DefineScreens("more_screen")

}