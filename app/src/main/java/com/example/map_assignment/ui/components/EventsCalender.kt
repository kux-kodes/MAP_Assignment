package com.example.map_assignment.ui.components



import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.*
import androidx.compose.material.icons.filled.DateRange


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventsScreen(
    onNavigate: (String) -> Unit = {},
    onEventClick: (Event) -> Unit = {}
) {
    var selectedDate by remember { mutableStateOf(LocalDate.now()) }
    val events = remember { sampleEvents() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Events",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.primary
                ),
                actions = {
                    IconButton(onClick = { /* Toggle calendar view */ }) {
                        Icon(Icons.Default.DateRange, contentDescription = "Calendar")

                    }
                }
            )
        },
        bottomBar = {

                MoreBottomNavigationBar(currentRoute = "event", onNavigate = onNavigate)
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            CompactCalendarView(
                selectedDate = selectedDate,
                onDateSelected = { selectedDate = it },
                modifier = Modifier.fillMaxWidth()
            )

            val filteredEvents = events.filter { it.date == selectedDate }
            if (filteredEvents.isEmpty()) {
                Text(
                    text = "No events for ${selectedDate.dayOfMonth}/${selectedDate.monthValue}",
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.bodyMedium
                )
            } else {
                EventsList(events = filteredEvents, onEventClick = onEventClick)
            }
        }
    }
}

data class Event(
    val id: String,
    val title: String,
    val date: LocalDate,
    val time: String,
    val location: String
)

fun sampleEvents(): List<Event> {
    return listOf(
        Event("1", "Team Meeting", LocalDate.now(), "10:00 AM", "Conference Room A"),
        Event("2", "Product Launch", LocalDate.now().plusDays(1), "2:00 PM", "Main Hall"),
        Event("3", "Client Call", LocalDate.now().plusDays(2), "11:30 AM", "Zoom")
    )
}

@Composable
fun CompactCalendarView(
    selectedDate: LocalDate,
    onDateSelected: (LocalDate) -> Unit,
    modifier: Modifier = Modifier
) {
    val daysToShow = 14
    val startDate = LocalDate.now().minusDays(7)
    val dates = List(daysToShow) { startDate.plusDays(it.toLong()) }

    Column(modifier = modifier) {
        Text(
            text = "${selectedDate.month.getDisplayName(TextStyle.FULL, Locale.getDefault())} ${selectedDate.year}",
            modifier = Modifier.padding(16.dp),
            fontWeight = FontWeight.Bold
        )

        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            items(dates) { date ->
                DayItem(
                    date = date,
                    isSelected = date == selectedDate,
                    onClick = { onDateSelected(date) }
                )
            }
        }
    }
}

@Composable
fun DayItem(
    date: LocalDate,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .padding(8.dp)
            .size(48.dp)
            .clip(CircleShape)
            .background(if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = date.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.getDefault()),
                fontSize = 12.sp,
                color = if (isSelected) Color.White else Color.Black
            )
            Text(
                text = date.dayOfMonth.toString(),
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                color = if (isSelected) Color.White else Color.Black
            )
        }
    }
}

@Composable
fun EventsList(events: List<Event>, onEventClick: (Event) -> Unit) {
    Column {
        events.forEach { event ->
            ListItem(
                headlineContent = { Text(event.title) },
                supportingContent = { Text("${event.time} @ ${event.location}") },
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onEventClick(event) }
                    .padding(vertical = 8.dp, horizontal = 16.dp)
            )
            Divider()
        }
    }
}

@Composable
fun MoreBottomNavigationBar(
    currentRoute: String,
    onNavigate: (String) -> Unit
) {
    NavigationBar {
        NavigationBarItem(
            icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
            label = { Text("Home") },
            selected = currentRoute == "home",
            onClick = { onNavigate("home") }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Edit, contentDescription = "Event") },
            label = { Text("Event") },
            selected = currentRoute == "event",
            onClick = { onNavigate("event") }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Star, contentDescription = "Stats") },
            label = { Text("Stats") },
            selected = currentRoute == "stats",
            onClick = { onNavigate("stats") }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Menu, contentDescription = "Teams") },
            label = { Text("Teams") },
            selected = currentRoute == "teams",
            onClick = { onNavigate("teams") }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.MoreVert, contentDescription = "More") },
            label = { Text("More") },
            selected = currentRoute == "more",
            onClick = { onNavigate("more") }
        )
    }
}

@Preview(showBackground = true)
@Composable
fun EventsScreenPreview() {
    MaterialTheme {
        EventsScreen()
    }
}
