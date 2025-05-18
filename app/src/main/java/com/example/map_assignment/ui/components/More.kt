package com.example.map_assignment.ui.components
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

import androidx.compose.material.icons.automirrored.filled.ArrowForward


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MoreScreen(
    currentRoute: String = "more",
    onNavigate: (String) -> Unit = {},
    onSignOut: () -> Unit = {},
    onManageAccount: () -> Unit = {},
    onUpdateDetails: () -> Unit = {},
    onAccountSecurity: () -> Unit = {},
    onNotificationSettings: () -> Unit = {},
    onSuggestionBox: () -> Unit = {}
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("More") }
            )
        },
        bottomBar = {
            BottomNavigationBar(currentRoute = currentRoute, onNavigate = onNavigate)
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxWidth()
        ) {
            MoreOptionItem(
                title = "Sign Out",
                trailingIcon = Icons.AutoMirrored.Filled.ArrowForward,
                onClick = onSignOut,
                showDivider = true
            )
            MoreOptionItem(
                title = "Manage Account",
                onClick = onManageAccount,
                showDivider = true
            )
            MoreOptionItem(
                title = "Update Person | Details",
                onClick = onUpdateDetails,
                showDivider = true
            )
            MoreOptionItem(
                title = "Account Security",
                onClick = onAccountSecurity,
                showDivider = true
            )
            MoreOptionItem(
                title = "Notification",
                onClick = onNotificationSettings,
                showDivider = true
            )
            MoreOptionItem(
                title = "Suggestion Box",
                onClick = onSuggestionBox,
                showDivider = false
            )
        }
    }
}


@Composable
fun MoreOptionItem(
    title: String,
    onClick: () -> Unit,
    trailingIcon: ImageVector? = null,
    showDivider: Boolean = true
) {
    Column {
        ListItem(
            headlineContent = { Text(title) },
            trailingContent = {
                trailingIcon?.let {
                    Icon(
                        imageVector = it,
                        contentDescription = null
                    )
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onClick)
                .padding(vertical = 12.dp, horizontal = 16.dp)
        )
        if (showDivider) {
            HorizontalDivider(
                modifier = Modifier.padding(vertical = 8.dp),
                thickness = 1.dp,
                color = Color.Gray
            )

        }
    }
}
@Composable
fun BottomNavigationBar(
    currentRoute: String,
    onNavigate: (String) -> Unit
) {
    NavigationBar {
        NavigationBarItem(
            icon = { Icon(Icons.Filled.Home, contentDescription = "Home") },
            label = { Text("Home") },
            selected = currentRoute == "home",
            onClick = { onNavigate("home") }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Filled.Edit, contentDescription = "Event") },
            label = { Text("Event") },
            selected = currentRoute == "event",
            onClick = { onNavigate("event") }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Filled.Star, contentDescription = "Stats") },
            label = { Text("Stats") },
            selected = currentRoute == "stats",
            onClick = { onNavigate("stats") }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Filled.Phone, contentDescription = "Teams") },
            label = { Text("Teams") },
            selected = currentRoute == "teams",
            onClick = { onNavigate("teams") }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Filled.MoreVert, contentDescription = "More") },
            label = { Text("More") },
            selected = currentRoute == "more",
            onClick = { onNavigate("more") }
        )
    }
}


@Preview(showBackground = true)
@Composable
fun MoreScreenPreview() {
    MaterialTheme {
        MoreScreen(
            currentRoute = "more",
            onNavigate = {} // Preview won’t navigate but this shows the bottom bar
        )
    }
}
