package com.example.map_assignment.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.map_assignment.ui.components.EventsScreen

@Composable
fun SetupNavGraph(navController: NavHostController){
    NavHost(navController = navController, startDestination = DefineScreens.EventScreen.route){
        composable(route= DefineScreens.EventScreen.route){
            EventsScreen(navController = navController)
        }
    }
}