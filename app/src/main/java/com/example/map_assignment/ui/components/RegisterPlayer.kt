package com.example.map_assignment.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.Alignment
import androidx.compose.ui.tooling.preview.Preview
import com.google.android.datatransport.Event

@Composable
fun RegisterPlayerScreen() {
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var dob by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("") }
    var team by remember { mutableStateOf("") }
    var position by remember { mutableStateOf("") }
    var shirtNumber by remember { mutableStateOf("") }
    var height by remember { mutableStateOf("") }

    Scaffold(
        bottomBar = { BottomNavigationBar() }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            Text("Register Player", style = MaterialTheme.typography.headlineSmall, modifier = Modifier.padding(bottom = 16.dp))

            OutlinedTextField(value = firstName, onValueChange = { firstName = it }, label = { Text("First Name") })
            OutlinedTextField(value = lastName, onValueChange = { lastName = it }, label = { Text("Last Name") })
            OutlinedTextField(value = dob, onValueChange = { dob = it }, label = { Text("DOB") })

            Text("Gender", modifier = Modifier.padding(top = 8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                RadioButton(selected = gender == "Male", onClick = { gender = "Male" })
                Text("Male", modifier = Modifier.padding(end = 16.dp))
                RadioButton(selected = gender == "Female", onClick = { gender = "Female" })
                Text("Female")
            }

            OutlinedTextField(value = team, onValueChange = { team = it }, label = { Text("Team Registered To") })
            OutlinedTextField(value = position, onValueChange = { position = it }, label = { Text("Position") })
            OutlinedTextField(value = shirtNumber, onValueChange = { shirtNumber = it }, label = { Text("Shirt Number") })
            OutlinedTextField(value = height, onValueChange = { height = it }, label = { Text("Height") })
        }
    }
}

@Composable
fun BottomNavigationBar() {
    NavigationBar {
        NavigationBarItem(
            icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
            label = { Text("Home") },
            selected = false,
            onClick = {}
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Edit, contentDescription = "Events") },
            label = { Text("Events") },
            selected = false,
            onClick = {}
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Face, contentDescription = "Stats") },
            label = { Text("Stats") },
            selected = false,
            onClick = {}
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Add, contentDescription = "Teams") },
            label = { Text("Teams") },
            selected = false,
            onClick = {}
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Done, contentDescription = "More") },
            label = { Text("More") },
            selected = false,
            onClick = {}
        )
    }
}

@Preview(showBackground = true, name = "Register Player Preview")
@Composable
fun RegisterPlayerPagePreview() {
    MaterialTheme { // Replace with your app's theme if needed
        RegisterPlayerScreen()
    }



}
